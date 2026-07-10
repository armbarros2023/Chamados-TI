import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import {allowedImageType} from '../security/upload-policy.js';

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedImageType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10 }
});
