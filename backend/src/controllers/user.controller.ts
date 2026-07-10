import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import db from '../db.js';
import { avatarDir, publicDir } from '../paths.js';
import {writeOptimizedImage} from '../security/image-storage.js';
import {cleanText, validatePassword} from '../security/validation.js';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rows } = await db.query(
            'SELECT id, username, name, email, role, avatar_url FROM users ORDER BY name ASC'
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, name, email, role, password } = req.body;

        if (!username || !name || !email || !role || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({message: 'A senha deve ter 10 caracteres, incluindo maiúscula, minúscula e número.'});
        }
        const safeUsername = cleanText(username, 100);
        const safeName = cleanText(name, 255);
        const safeEmail = cleanText(email, 255).toLowerCase();

        const existingUser = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [safeUsername, safeEmail]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Nome de usuário ou e-mail já cadastrado.' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const queryText = `
            INSERT INTO users (username, name, email, role, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, name, email, role, created_at;
        `;
        const { rows } = await db.query(queryText, [safeUsername, safeName, safeEmail, role, passwordHash]);

        res.status(201).json(rows[0]);

    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Nome, email e função são obrigatórios.' });
        }
        if (password && !validatePassword(password)) {
            return res.status(400).json({message: 'A senha deve ter 10 caracteres, incluindo maiúscula, minúscula e número.'});
        }

        const fields = ['name', 'email', 'role'];
        const values = [cleanText(name, 255), cleanText(email, 255).toLowerCase(), role];
        let query = 'UPDATE users SET name = $1, email = $2, role = $3';
        
        // Se uma nova senha foi fornecida, adiciona ao update
        if (password) {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            fields.push('password_hash');
            values.push(passwordHash);
            query += `, password_hash = $${values.length}`;
        }
        
        query += ` WHERE id = $${values.length + 1} RETURNING id, username, name, email, role, avatar_url;`;
        values.push(id);

        const { rows } = await db.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Impede que o usuário logado se auto-delete
        if (req.user?.id === id) {
            return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
        }

        const deleteResult = await db.query('DELETE FROM users WHERE id = $1', [id]);

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(204).send(); // 204 No Content: sucesso, mas sem corpo na resposta

    } catch (error) {
        next(error);
    }
};

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const filename = await writeOptimizedImage(req.file.buffer, req.file.mimetype, avatarDir, `avatar-${req.user.id}`);
    const avatarUrl = `/avatars/${filename}`;
    const userId = req.user.id; // Pegamos o ID do token

    // Busca o avatar antigo no banco para poder deletá-lo
    const oldData = await db.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
    const oldAvatarUrl = oldData.rows[0]?.avatar_url;

    // Se o avatar antigo existe, deleta o arquivo físico
    if (oldAvatarUrl && oldAvatarUrl.startsWith('/avatars')) {
      const oldAvatarPath = path.join(publicDir, oldAvatarUrl);
      fs.unlink(oldAvatarPath).catch(err => console.log("Info: não foi possível remover o avatar antigo:", err.message));
    }

    // Atualiza o usuário no banco de dados com a nova URL do avatar
    const { rows } = await db.query(
        'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, name, email, role, avatar_url',
        [avatarUrl, userId]
    );
    const updatedUser = rows[0];

    // Atualiza o avatar em todos os tickets e comentários associados a esse usuário
    await db.query(`UPDATE tickets SET requester = jsonb_set(requester, '{avatarUrl}', $1) WHERE requester->>'name' = $2`, [JSON.stringify(avatarUrl), updatedUser.name]);
    await db.query(`UPDATE comments SET author = jsonb_set(author, '{avatarUrl}', $1) WHERE author->>'name' = $2`, [JSON.stringify(avatarUrl), updatedUser.name]);
    
    // Remove o campo password_hash da resposta
    const { password_hash, ...userResponse } = updatedUser;

    res.status(200).json({
        message: 'Avatar atualizado com sucesso!',
        user: {
            ...userResponse,
            avatarUrl: userResponse.avatar_url // Garante o camelCase no frontend
        }
    });

  } catch (error) {
    next(error);
  }
};
