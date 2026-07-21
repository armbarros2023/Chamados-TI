import { Response, NextFunction } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus } from '../types.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import * as emailService from '../services/emailService.js';
import path from 'path';
import {privateAttachmentDir} from '../paths.js';
import {deletePrivateAttachment, writeAttachment, writeOptimizedImage} from '../security/image-storage.js';
import {isVideoType} from '../security/upload-policy.js';
import {cleanText} from '../security/validation.js';
import {isTicketSystem, ticketSystems} from '../security/ticket-system.js';

export const getTickets = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 15, 1), 100);
        const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);
        const queryParams: (string | number)[] = [];
        const whereConditions: string[] = [];
        const addParam = (value: string | number) => {
            queryParams.push(value);
            return `$${queryParams.length}`;
        };

        const selectFields = `
            id, title, description, status, priority, category, requester, created_by,
            attachment_url AS "attachmentUrl", 
            ticket_number AS "ticketNumber",
            created_at AS "date",
            department,
            system,
            closed_at AS "closedAt",
            unread_by_admin AS "unreadByAdmin",
            unread_by_requester AS "unreadByRequester"
        `;

        if (user?.role !== 'Administrador') {
            const userId = addParam(user?.id || '');
            const username = addParam(user?.username || '');
            whereConditions.push(`(requester_user_id = ${userId} OR (requester_user_id IS NULL AND created_by->>'username' = ${username}))`);
        }

        const status = req.query.status;
        if (status !== undefined) {
            if (typeof status !== 'string' || !Object.values(TicketStatus).includes(status as TicketStatus)) {
                return res.status(400).json({message: 'Status de filtro inválido.'});
            }
            whereConditions.push(`status = ${addParam(status)}`);
        }

        const system = req.query.system;
        if (system !== undefined) {
            if (!isTicketSystem(system)) return res.status(400).json({message: 'Sistema de filtro inválido.'});
            whereConditions.push(`system = ${addParam(system)}`);
        }

        const department = typeof req.query.department === 'string' ? cleanText(req.query.department, 100) : '';
        if (department) whereConditions.push(`department = ${addParam(department)}`);

        const search = typeof req.query.search === 'string' ? cleanText(req.query.search, 180).trim() : '';
        if (search) {
            const term = addParam(`%${search}%`);
            whereConditions.push(`(ticket_number ILIKE ${term} OR title ILIKE ${term} OR requester->>'name' ILIKE ${term})`);
        }

        const isDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        if (dateFrom !== undefined && !isDate(dateFrom)) return res.status(400).json({message: 'Data inicial inválida.'});
        if (dateTo !== undefined && !isDate(dateTo)) return res.status(400).json({message: 'Data final inválida.'});
        if (typeof dateFrom === 'string') whereConditions.push(`created_at >= ${addParam(`${dateFrom}T00:00:00-03:00`)}`);
        if (typeof dateTo === 'string') whereConditions.push(`created_at < (${addParam(`${dateTo}T00:00:00-03:00`)}::timestamptz + INTERVAL '1 day')`);

        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const countParams = [...queryParams];
        const limitParam = addParam(limit);
        const offsetParam = addParam(offset);
        const dataQueryText = `SELECT ${selectFields} FROM tickets ${whereClause} ORDER BY created_at DESC LIMIT ${limitParam} OFFSET ${offsetParam}`;
        const countQueryText = `SELECT COUNT(*) FROM tickets ${whereClause}`;
        
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
        const { title, description, category, priority, department = 'Não informado', system } = req.body;
        const loggedInUser = req.user;

        if (!title || !description || !category || !priority || !isTicketSystem(system) || !loggedInUser) {
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
            department: cleanText(department, 100),
            system,
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
            INSERT INTO tickets (id, ticket_number, title, description, status, priority, category, requester, created_by, requester_user_id, department, system)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
        `;
        const queryParams = [
            newTicketData.id, newTicketData.ticketNumber, newTicketData.title, newTicketData.description,
            newTicketData.status, newTicketData.priority, newTicketData.category, newTicketData.requester, newTicketData.createdBy, loggedInUser.id, newTicketData.department, newTicketData.system
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

        const attachmentUrl = isVideoType(req.file.mimetype)
            ? await writeAttachment(req.file.buffer, req.file.mimetype, privateAttachmentDir, `ticket-${id}`)
            : await writeOptimizedImage(req.file.buffer, req.file.mimetype, privateAttachmentDir, `ticket-${id}`);
        
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

        const currentTicket = await db.query('SELECT status FROM tickets WHERE id = $1', [id]);
        if (currentTicket.rows.length === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
            [TicketStatus.Open]: [TicketStatus.InProgress],
            [TicketStatus.InProgress]: [TicketStatus.Resolved],
            [TicketStatus.Resolved]: [],
        };
        const currentStatus = currentTicket.rows[0].status as TicketStatus;
        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            return res.status(409).json({ message: 'Transição de status não permitida para este chamado.' });
        }

        const { rows } = await db.query(
            `UPDATE tickets
             SET status = $1::varchar,
                 closed_at = CASE WHEN $1::varchar = 'resolvido'::varchar THEN COALESCE(closed_at, NOW()) ELSE NULL END
             WHERE id = $2 AND status = $3::varchar RETURNING *`,
            [newStatus, id, currentStatus],
        );
        if (rows.length === 0) {
            return res.status(409).json({ message: 'O status do chamado foi alterado. Atualize a fila e tente novamente.' });
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
        const result = await db.query('DELETE FROM tickets WHERE id = $1 RETURNING attachment_url', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }
        await deletePrivateAttachment(result.rows[0].attachment_url, privateAttachmentDir).catch(error => {
            console.error('Falha ao remover anexo privado após exclusão do chamado:', error);
        });
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
            )
            RETURNING attachment_url;
        `;
        const result = await db.query(query);
        await Promise.all(result.rows.map(row => deletePrivateAttachment(row.attachment_url, privateAttachmentDir).catch(error => {
            console.error('Falha ao remover anexo privado após limpeza por contagem:', error);
        })));
        const totalResult = await db.query('SELECT COUNT(*)::int AS total FROM tickets');
        res.status(200).json({ message: `${result.rowCount ?? 0} chamado(s) antigo(s) excluído(s). A regra mantém os 15 mais recentes; restam ${totalResult.rows[0].total}.` });
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
        const query = `DELETE FROM tickets WHERE created_at < NOW() - INTERVAL '30 days' RETURNING attachment_url;`;
        const result = await db.query(query);
        await Promise.all(result.rows.map(row => deletePrivateAttachment(row.attachment_url, privateAttachmentDir).catch(error => {
            console.error('Falha ao remover anexo privado após limpeza por data:', error);
        })));
        res.status(200).json({ message: `${result.rowCount ?? 0} chamado(s) com mais de 30 dias excluído(s). Só chamados anteriores a 30 dias são removidos.` });
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

export const getTicketMetrics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const queryParams: string[] = [TicketStatus.Resolved];
        let scopeClause = '';

        // Administradores visualizam a operação inteira; usuários veem somente seus próprios chamados.
        if (user?.role !== 'Administrador') {
            queryParams.push(user?.id || '', user?.username || '');
            scopeClause = `WHERE (requester_user_id = $2 OR (requester_user_id IS NULL AND created_by->>'username' = $3))`;
        }
        const {rows} = await db.query(`
          SELECT COALESCE(department, 'Não informado') AS department,
                 COUNT(*)::int AS total,
                 COUNT(*) FILTER (WHERE status = $1)::int AS closed,
                 ROUND((AVG(EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600) FILTER (WHERE closed_at IS NOT NULL))::numeric, 2) AS average_resolution_hours
          FROM tickets
          ${scopeClause}
          GROUP BY COALESCE(department, 'Não informado')
          ORDER BY COALESCE(department, 'Não informado') ASC
        `, queryParams);
        res.status(200).json(rows.map(row => ({
            department: row.department,
            total: row.total,
            closed: row.closed,
            averageClosureHours: row.average_resolution_hours === null ? null : Number(row.average_resolution_hours),
        })));
    } catch (error) {
        next(error);
    }
};

export const getTicketSystemMetrics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'Administrador') {
            return res.status(403).json({message: 'Apenas administradores podem consultar métricas.'});
        }
        const {rows} = await db.query(`
          SELECT system, COUNT(*)::int AS closed_count
          FROM tickets
          WHERE system = ANY($1::varchar[])
            AND status = $2
            AND closed_at >= (date_trunc('month', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')
            AND closed_at < ((date_trunc('month', NOW() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '1 month') AT TIME ZONE 'America/Sao_Paulo')
          GROUP BY system
        `, [ticketSystems, TicketStatus.Resolved]);
        const totals = new Map(rows.map(row => [row.system, Number(row.closed_count)]));
        res.status(200).json(ticketSystems.map(system => ({system, closedCount: totals.get(system) || 0})));
    } catch (error) {
        next(error);
    }
};
