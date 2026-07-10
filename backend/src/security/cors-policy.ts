type OriginCallback = (error: Error | null, allow?: boolean) => void;

export const parseAllowedOrigins = (value: string | undefined): string[] => {
  if (!value?.trim()) return [];

  const origins = value.split(',').map(origin => origin.trim()).filter(Boolean).map(origin => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`Origem inválida na configuração de CORS: ${origin}`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error(`Origem inválida na configuração de CORS: ${origin}`);
    }
    return parsed.origin;
  });

  return [...new Set(origins)];
};

export const createOriginValidator = (allowedOrigins: string[]) => (
  origin: string | undefined,
  callback: OriginCallback,
) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error('Origem não permitida pela política de CORS.'));
};
