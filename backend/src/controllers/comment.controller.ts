import { Response, NextFunction } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {cleanText} from '../security/validation.js';

export const getCommentsForTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; 
        const { rows } = await db.query('SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC', [id]);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

export const addCommentToTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id: ticketId } = req.params;
        const { text } = req.body;
        const authorInfo = req.user;

        if (!text || !authorInfo) {
            return res.status(400).json({ message: 'Texto do comentário e autenticação são obrigatórios.' });
        }

        const userQuery = await db.query('SELECT name, role, avatar_url FROM users WHERE id = $1', [authorInfo.id]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Autor do comentário não encontrado.' });
        }
        const freshAuthorData = userQuery.rows[0];

        const newComment = {
            id: uuidv4(),
            ticket_id: ticketId,
            author: { 
                name: freshAuthorData.name, 
                role: freshAuthorData.role, 
                avatarUrl: freshAuthorData.avatar_url
            },
            text: cleanText(text, 5000)
        };

        const queryText = `INSERT INTO comments (id, ticket_id, author, text) VALUES ($1, $2, $3, $4) RETURNING *`;
        const { rows } = await db.query(queryText, [newComment.id, newComment.ticket_id, newComment.author, newComment.text]);

        if (authorInfo.role === 'Administrador') {
            await db.query('UPDATE tickets SET unread_by_requester = TRUE, unread_by_admin = FALSE WHERE id = $1', [ticketId]);
        } else {
            await db.query('UPDATE tickets SET unread_by_admin = TRUE, unread_by_requester = FALSE WHERE id = $1', [ticketId]);
        }

        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
};
