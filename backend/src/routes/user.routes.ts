import { Router, RequestHandler } from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { getAllUsers, createUser, uploadAvatar, deleteUser, updateUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Rota para listar todos os usuários (protegida para admins)
router.get('/', protect as RequestHandler, admin as RequestHandler, getAllUsers as RequestHandler);

// Rota para criar um novo usuário (protegida para admins)
router.post('/', protect as RequestHandler, admin as RequestHandler, createUser as RequestHandler);

// Rota para atualizar um usuário (protegida para admins)
router.put('/:id', protect as RequestHandler, admin as RequestHandler, updateUser as RequestHandler);

// Rota para deletar um usuário (protegida para admins)
router.delete('/:id', protect as RequestHandler, admin as RequestHandler, deleteUser as RequestHandler);

// Rota para upload de avatar (acessível a todos os usuários logados)
router.post(
    '/upload-avatar', 
    protect as RequestHandler, 
    upload.single('avatar'), 
    uploadAvatar as RequestHandler
);

export default router;