import path from 'path';

const projectRoot = process.cwd();
const dataRoot = process.env.DATA_DIR || projectRoot;

export const publicDir = path.join(dataRoot, 'public');
export const usersFilePath = path.join(projectRoot, 'scripts', 'users.json');
export const avatarDir = path.join(publicDir, 'avatars');
export const privateAttachmentDir = path.join(dataRoot, 'uploads', 'ticket_attachments');
