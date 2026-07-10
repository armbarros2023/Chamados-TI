import path from 'path';

// O 'process.cwd()' agora será /var/www/helpdesk/backend, graças ao PM2.
const projectRoot = process.cwd();

export const publicDir = path.join(projectRoot, 'public');
export const usersFilePath = path.join(projectRoot, 'scripts', 'users.json');
export const avatarDir = path.join(publicDir, 'avatars');
export const privateAttachmentDir = path.join(projectRoot, 'uploads', 'ticket_attachments');
