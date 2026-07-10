import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {safeImageExtension} from './upload-policy.js';

export const writeOptimizedImage = async (buffer: Buffer, mime: string, directory: string, prefix: string) => {
  const extension = safeImageExtension(mime);
  const filename = `${prefix}-${randomUUID()}${extension}`;
  await mkdir(directory, {recursive: true});
  const image = sharp(buffer, {failOn: 'warning'}).rotate().resize({width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true});
  if (mime === 'image/jpeg') await image.jpeg({quality: 85, mozjpeg: true}).toFile(path.join(directory, filename));
  else if (mime === 'image/png') await image.png({compressionLevel: 9}).toFile(path.join(directory, filename));
  else await image.webp({quality: 82}).toFile(path.join(directory, filename));
  return filename;
};
