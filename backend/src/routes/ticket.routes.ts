import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { 
    createTicket, 
    getTickets, 
    updateTicketStatus,
    deleteTicket,
    pruneTicketsByCount,
    pruneTicketsByDate,
    markTicketAsRead,
    uploadAttachment,
    sendEmailNotification,
    downloadAttachment,
    getTicketMetrics,
    getTicketSystemMetrics
} from '../controllers/ticket.controller.js';
import { getCommentsForTicket, addCommentToTicket } from '../controllers/comment.controller.js';
import { admin, protect, requireTicketAccess } from '../middleware/auth.middleware.js';
import { ticketUpload } from '../middleware/upload.middleware.js';

const router = Router();
const ticketCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {message: 'Muitas criações de chamados. Tente novamente em alguns minutos.'},
});
const attachmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {message: 'Muitos envios de anexo. Tente novamente em alguns minutos.'},
});
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {message: 'Muitos envios de e-mail. Tente novamente em alguns minutos.'},
});

router.get('/metrics', protect as RequestHandler, getTicketMetrics as RequestHandler);
router.get('/metrics/systems', protect as RequestHandler, admin as RequestHandler, getTicketSystemMetrics as RequestHandler);

// GET
router.get('/', protect as RequestHandler, getTickets as RequestHandler);
router.get('/:id/comments', protect as RequestHandler, requireTicketAccess as RequestHandler, getCommentsForTicket as RequestHandler);
router.get('/:id/attachment', protect as RequestHandler, requireTicketAccess as RequestHandler, downloadAttachment as RequestHandler);

// POST
router.post('/', protect as RequestHandler, ticketCreateLimiter as RequestHandler, createTicket as RequestHandler);
router.post('/:id/comments', protect as RequestHandler, requireTicketAccess as RequestHandler, addCommentToTicket as RequestHandler);
router.post(
    '/:id/upload-attachment',
    protect as RequestHandler,
    requireTicketAccess as RequestHandler,
    attachmentLimiter as RequestHandler,
    ticketUpload.single('attachment'),
    uploadAttachment as RequestHandler
);
router.post('/:id/send-email', protect as RequestHandler, requireTicketAccess as RequestHandler, emailLimiter as RequestHandler, sendEmailNotification as RequestHandler);

// PATCH
router.patch('/:id/status', protect as RequestHandler, admin as RequestHandler, updateTicketStatus as RequestHandler);
router.patch('/:id/mark-read', protect as RequestHandler, requireTicketAccess as RequestHandler, markTicketAsRead as RequestHandler);

// DELETE
router.delete('/prune/by-count', protect as RequestHandler, admin as RequestHandler, pruneTicketsByCount as RequestHandler);
router.delete('/prune/by-date', protect as RequestHandler, admin as RequestHandler, pruneTicketsByDate as RequestHandler);
router.delete('/:id', protect as RequestHandler, admin as RequestHandler, deleteTicket as RequestHandler);

export default router;
