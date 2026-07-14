const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
};

export const allowedImageType = (mime: string) => mime.startsWith('image/') && Object.hasOwn(EXTENSIONS, mime);
export const allowedAttachmentType = (mime: string) => Object.hasOwn(EXTENSIONS, mime);
export const isVideoType = (mime: string) => mime.startsWith('video/');

export const hasValidVideoSignature = (buffer: Buffer) => (
  buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp'
);

export const safeImageExtension = (mime: string) => {
  const extension = EXTENSIONS[mime];
  if (!extension) throw new Error('Tipo de imagem não permitido.');
  return extension;
};

export const safeAttachmentExtension = (mime: string) => {
  const extension = EXTENSIONS[mime];
  if (!extension) throw new Error('Tipo de anexo não permitido.');
  return extension;
};
