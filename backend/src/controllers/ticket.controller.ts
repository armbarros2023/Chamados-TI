import { Response, NextFunction } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus } from '../types.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import * as emailService from '../services/emailService.js';
import path from 'path';
import {privateAttachmentDir} from '../paths.js';
import {writeOptimizedImage} from '../security/image-storage.js';
import {cleanText} from '../security/validation.js';

export const getTickets = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 15, 1), 100);
        const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);

        let dataQueryText: string;
        let countQueryText: string;
        let queryParams: (string | number)[] = [];
        let countParams: (string | number)[] = [];

        const selectFields = `
            id, title, description, status, priority, category, requester, created_by,
            attachment_url AS "attachmentUrl", 
            ticket_number AS "ticketNumber", 
            created_at AS "date",
            unread_by_admin AS "unreadByAdmin",
            unread_by_requester AS "unreadByRequester"
        `;

        if (user?.role !== 'Administrador') {
            dataQueryText = `SELECT ${selectFields} FROM tickets WHERE requester_user_id = $1 OR (requester_user_id IS NULL AND created_by->>'username' = $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
            countQueryText = `SELECT COUNT(*) FROM tickets WHERE requester_user_id = $1 OR (requester_user_id IS NULL AND created_by->>'username' = $2)`;
            queryParams = [user?.id || '', user?.username || '', limit, offset];
            countParams = [user?.id || '', user?.username || ''];
        } else {
            dataQueryText = `SELECT ${selectFields} FROM tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
            countQueryText = `SELECT COUNT(*) FROM tickets`;
            queryParams = [limit, offset];
        }
        
        const { rows } = await db.query(dataQueryText, queryParams);
        const countResult = await db.query(countQueryText, countParams);
        const total = parseInt(countResult.rows[0].count, 10);

        res.status(200).json({ tickets: rows, total });

    } catch (error) {
        console.error("Erro ao buscar chamados:", error);
        next(error);
    }
};


export const markTicketAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const ticketResult = await db.query(`SELECT requester->>'name' as requester_name FROM tickets WHERE id = $1`, [id]);
        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        
        const requesterName = ticketResult.rows[0].requester_name;

        // Se o usuário atual for admin, marca como lido por ele.
        if (currentUser?.role === 'Administrador') {
            await db.query('UPDATE tickets SET unread_by_admin = FALSE WHERE id = $1', [id]);
        } 
        // Se o usuário atual for o solicitante, marca como lido por ele.
        else if (currentUser?.name === requesterName) {
            await db.query('UPDATE tickets SET unread_by_requester = FALSE WHERE id = $1', [id]);
        }

        res.status(204).send();

    } catch (error) {
        console.error("Erro ao marcar chamado como lido:", error);
        next(error);
    }
};

export const createTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, category, priority } = req.body;
        const loggedInUser = req.user;

        if (!title || !description || !category || !priority || !loggedInUser) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios e o usuário deve estar autenticado.' });
        }

        const userQuery = await db.query('SELECT name, role, email, avatar_url FROM users WHERE id = $1', [loggedInUser.id]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário solicitante não encontrado no banco de dados.' });
        }
        const freshUserData = userQuery.rows[0];

        const ticketNumberResult = await db.query("SELECT nextval('ticket_number_seq') AS number");
        const newTicketData = {
            id: uuidv4(),
            ticketNumber: `TI-${String(ticketNumberResult.rows[0].number).padStart(6, '0')}`,
            title: cleanText(title, 180),
            description: cleanText(description, 10000),
            category: cleanText(category, 50),
            priority: cleanText(priority, 50),
            status: TicketStatus.Open,
            requester: {
                name: freshUserData.name,
                role: freshUserData.role,
                email: freshUserData.email,
                avatarUrl: freshUserData.avatar_url
            },
            createdBy: { username: loggedInUser.username, name: loggedInUser.name }
        };

        const queryText = `
            INSERT INTO tickets (id, ticket_number, title, description, status, priority, category, requester, created_by, requester_user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
        `;
        const queryParams = [
            newTicketData.id, newTicketData.ticketNumber, newTicketData.title, newTicketData.description,
            newTicketData.status, newTicketData.priority, newTicketData.category, newTicketData.requester, newTicketData.createdBy, loggedInUser.id
        ];

        const { rows } = await db.query(queryText, queryParams);
        const createdTicket = rows[0];

        try {
            // 1. Buscar os e-mails de todos os administradores
            const adminUsers = await db.query("SELECT email FROM users WHERE role = 'Administrador' AND email IS NOT NULL");
            const adminEmails = adminUsers.rows.map(user => user.email);

            // 2. Enviar a notificação se houver admins com e-mail
            if (adminEmails.length > 0) {
                // Monta um objeto Ticket completo para a função de email
                const ticketForEmail: Ticket = {
                    ...createdTicket,
                    ticketNumber: createdTicket.ticket_number,
                    requester: newTicketData.requester
                };
                await emailService.sendNewTicketNotificationToAdmins(ticketForEmail, adminEmails);
            }
        } catch (emailError) {
            console.error("Falha secundária ao enviar e-mail de notificação:", emailError);
        }
        const responseTicket = { ...createdTicket, requester: { ...createdTicket.requester, avatarUrl: createdTicket.requester.avatarurl } };
        delete responseTicket.requester.avatarurl;

        res.status(201).json(responseTicket);

    } catch (error) {
        console.error("Erro ao criar chamado:", error);
        next(error);
    }
};

export const uploadAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
        }

        const attachmentUrl = await writeOptimizedImage(req.file.buffer, req.file.mimetype, privateAttachmentDir, `ticket-${id}`);
        
        const result = await db.query(
            'UPDATE tickets SET attachment_url = $1 WHERE id = $2 RETURNING id, attachment_url',
            [attachmentUrl, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Erro ao fazer upload do anexo:", error);
        next(error);
    }
};

export const downloadAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query('SELECT attachment_url FROM tickets WHERE id = $1', [req.params.id]);
        const filename = result.rows[0]?.attachment_url;
        if (!filename) return res.status(404).json({message: 'Anexo não encontrado.'});
        return res.sendFile(path.join(privateAttachmentDir, path.basename(filename)));
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        if (!Object.values(TicketStatus).includes(newStatus)) {
            return res.status(400).json({ message: 'Status inválido.' });
        }
        
        if (req.user?.role !== 'Administrador') {
            return res.status(403).json({ message: 'Apenas administradores podem alterar o status.' });
        }

        const { rows } = await db.query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', [newStatus, id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        next(error);
    }
};


export const deleteTicket = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'Administrador') {
            return res.status(403).json({ message: 'Apenas administradores podem excluir chamados.' });
        }
        const { id } = req.params;
        const result = await db.query('DELETE FROM tickets WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Erro ao excluir chamado:", error);
        next(error);
    }
};

export const pruneTicketsByCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'Administrador') {
            return res.status(403).json({ message: 'Ação permitida apenas para administradores.' });
        }
        // Exclui todos os chamados, exceto os 15 mais recentes
        const query = `
            DELETE FROM tickets
            WHERE id NOT IN (
                SELECT id FROM tickets ORDER BY created_at DESC LIMIT 15
            );
        `;
        const result = await db.query(query);
        res.status(200).json({ message: `${result.rowCount} chamado(s) antigo(s) excluído(s).` });
    } catch (error) {
        console.error("Erro ao excluir chamados por contagem:", error);
        next(error);
    }
};

export const pruneTicketsByDate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'Administrador') {
            return res.status(403).json({ message: 'Ação permitida apenas para administradores.' });
        }
        // Exclui chamados com mais de 30 dias
        const query = `DELETE FROM tickets WHERE created_at < NOW() - INTERVAL '30 days';`;
        const result = await db.query(query);
        res.status(200).json({ message: `${result.rowCount} chamado(s) com mais de 30 dias excluído(s).` });
    } catch (error) {
        console.error("Erro ao excluir chamados por data:", error);
        next(error);
    }
};

export const sendEmailNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const fromUser = req.user;

        if (!fromUser) {
            return res.status(401).json({ message: 'Não autenticado.' });
        }
        if (!message) {
            return res.status(400).json({ message: 'A mensagem é obrigatória.' });
        }
        const safeMessage = cleanText(message, 5000);

        // 1. Encontrar o chamado no banco
        const ticketResult = await db.query('SELECT *, ticket_number AS "ticketNumber" FROM tickets WHERE id = $1', [id]);
        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        const ticket: Ticket = ticketResult.rows[0];

        // 2. Ler o arquivo de usuários para encontrar os administradores
        const adminUsers = await db.query("SELECT email FROM users WHERE role = 'Administrador' AND email IS NOT NULL");
        const adminEmails = adminUsers.rows.map(user => user.email);

        if (adminEmails.length === 0) {
            return res.status(500).json({ message: 'Nenhum administrador encontrado para notificar.' });
        }

        // 3. Enviar o email para os administradores
        await emailService.sendEmailToAdmins(ticket, fromUser, safeMessage, adminEmails);

        // 4. Registrar o envio como um comentário no chamado
        const commentText = `Email enviado para a equipe de administradores com a mensagem:\n"${safeMessage}"`;
        const commentId = uuidv4();
        await db.query(
            'INSERT INTO comments (id, ticket_id, author, text) VALUES ($1, $2, $3, $4)',
            [commentId, id, fromUser, commentText]
        );

        res.status(200).json({ message: 'Email enviado para os administradores e registrado como comentário.' });

    } catch (error) {
        console.error("Erro ao enviar notificação por email:", error);
        next(error);
    }
};
