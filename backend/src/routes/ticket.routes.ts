import { Router, RequestHandler } from 'express';
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
    downloadAttachment
} from '../controllers/ticket.controller.js';
import { getCommentsForTicket, addCommentToTicket } from '../controllers/comment.controller.js';
import { protect, requireTicketAccess } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// GET
router.get('/', protect as RequestHandler, getTickets as RequestHandler);
router.get('/:id/comments', protect as RequestHandler, requireTicketAccess as RequestHandler, getCommentsForTicket as RequestHandler);
router.get('/:id/attachment', protect as RequestHandler, requireTicketAccess as RequestHandler, downloadAttachment as RequestHandler);

// POST
router.post('/', protect as RequestHandler, createTicket as RequestHandler);
router.post('/:id/comments', protect as RequestHandler, requireTicketAccess as RequestHandler, addCommentToTicket as RequestHandler);
router.post(
    '/:id/upload-attachment',
    protect as RequestHandler,
    requireTicketAccess as RequestHandler,
    upload.single('attachment'), 
    uploadAttachment as RequestHandler
);
router.post('/:id/send-email', protect as RequestHandler, requireTicketAccess as RequestHandler, sendEmailNotification as RequestHandler);

// PATCH
router.patch('/:id/status', protect as RequestHandler, updateTicketStatus as RequestHandler);
router.patch('/:id/mark-read', protect as RequestHandler, requireTicketAccess as RequestHandler, markTicketAsRead as RequestHandler);

// DELETE
router.delete('/prune/by-count', protect as RequestHandler, pruneTicketsByCount as RequestHandler);
router.delete('/prune/by-date', protect as RequestHandler, pruneTicketsByDate as RequestHandler);
router.delete('/:id', protect as RequestHandler, deleteTicket as RequestHandler);

export default router;
