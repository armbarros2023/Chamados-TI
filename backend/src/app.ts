import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import userRoutes from './routes/user.routes.js';
import db from './db.js';
import {createOriginValidator, parseAllowedOrigins} from './security/cors-policy.js';
import {avatarDir} from './paths.js';

const mountApi = (app: express.Express, prefix: string) => {
  app.get(`${prefix}/health`, (_req, res) => {
    res.set('Cache-Control', 'no-store').json({status: 'ok', apiVersion: 'v1'});
  });
  app.get(`${prefix}/ready`, async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.set('Cache-Control', 'no-store').json({status: 'ready', apiVersion: 'v1'});
    } catch {
      res.set('Cache-Control', 'no-store').status(503).json({status: 'unavailable', apiVersion: 'v1'});
    }
  });
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/tickets`, ticketRoutes);
  app.use(`${prefix}/users`, userRoutes);
};

export const createApp = () => {
  const app = express();
  const configuredOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL;
  const allowedOrigins = parseAllowedOrigins(configuredOrigins || 'http://127.0.0.1:5173,http://127.0.0.1:5174');

  if (process.env.NODE_ENV === 'production' && !configuredOrigins) {
    throw new Error('CLIENT_URLS é obrigatório em produção.');
  }
  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet({crossOriginResourcePolicy: {policy: 'same-site'}}));
  app.use(cors({origin: createOriginValidator(allowedOrigins), credentials: true}));
  app.use(express.json({limit: '1mb'}));
  app.use(express.urlencoded({extended: true, limit: '1mb'}));
  app.use('/avatars', express.static(avatarDir, {dotfiles: 'deny', index: false}));

  mountApi(app, '/api/v1');

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : 'Erro interno inesperado.';
    const errorCode = (error as {code?: string})?.code;
    if (errorCode === 'LIMIT_FILE_SIZE') {
      const field = (error as {field?: string})?.field;
      res.status(413).json({message: field === 'attachment' ? 'O anexo excede o limite de 100 MB.' : 'A imagem de perfil excede o limite de 5 MB.'});
      return;
    }
    const isCorsError = message === 'Origem não permitida pela política de CORS.';
    const isClientError = /arquivo|imagem|limite|texto|obrigatório|inválido/i.test(message);
    if (!isCorsError && !isClientError) console.error('Erro não tratado:', error);
    const status = isCorsError ? 403 : isClientError ? 400 : 500;
    res.status(status).json({message: status === 500 ? 'Erro interno do servidor.' : message});
  });

  return app;
};
