const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const allowedImageType = (mime: string) => Object.hasOwn(EXTENSIONS, mime);

export const safeImageExtension = (mime: string) => {
  const extension = EXTENSIONS[mime];
  if (!extension) throw new Error('Tipo de imagem não permitido.');
  return extension;
};
