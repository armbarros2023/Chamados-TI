// Importamos Router E RequestHandler de express
import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, refresh } from '../controllers/auth.controller.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Janela de tempo: 5 minutos
    max: 5, // Máximo de 5 tentativas de login por IP dentro da janela de tempo
    message: {
        message: 'Muitas tentativas de login a partir deste IP. Por favor, tente novamente após 5 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, login as RequestHandler);
router.post('/refresh', refresh as RequestHandler);
router.post('/logout', logout as RequestHandler);

export default router;
