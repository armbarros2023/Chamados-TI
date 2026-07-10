import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import {canAccessTicket} from '../security/ticket-access.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET não está definido nas variáveis de ambiente.');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    name: string;
    role: string;
    email: string;
    avatarUrl?: string;
    permissions: string[];
  };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {issuer: 'chamados-ti', audience: 'chamados-ti-web'}) as {id: string};
    const result = await db.query('SELECT id, username, name, role, email, avatar_url FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(401).json({message: 'Usuário da sessão não existe mais.'});
    const user = result.rows[0];
    req.user = {...user, avatarUrl: user.avatar_url, permissions: []};
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Não autorizado, token inválido.' });
  }
};

export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'Administrador') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Rota somente para administradores.' });
  }
};

export const requireTicketAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({message: 'Não autenticado.'});

  try {
    const result = await db.query(
      `SELECT requester_user_id, created_by->>'username' AS requester_username
       FROM tickets WHERE id = $1`,
      [req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({message: 'Chamado não encontrado.'});

    const ticket = result.rows[0];
    const ownsLegacyTicket = !ticket.requester_user_id && ticket.requester_username === req.user.username;
    if (!canAccessTicket(req.user, ticket.requester_user_id) && !ownsLegacyTicket) {
      return res.status(403).json({message: 'Você não tem permissão para acessar este chamado.'});
    }
    next();
  } catch (error) {
    next(error);
  }
};
