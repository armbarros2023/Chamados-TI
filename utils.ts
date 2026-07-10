/**
 * Constrói a URL completa para um avatar a partir do caminho relativo.
 * @param relativePath - O caminho salvo no banco, ex: /avatars/imagem.jpg
 * @returns A URL completa, ex: http://localhost:3003/avatars/imagem.jpg
 */
export const getFullAvatarUrl = (relativePath: string | undefined): string | undefined => {
  if (!relativePath) {
    return undefined; // Retorna undefined se não houver caminho
  }

  // Define a URL base do backend, removendo o /api se existir.
  const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api')
    .replace(/\/api(?:\/v\d+)?\/?$/, '');

  // Evita adicionar o prefixo se já for uma URL completa (ex: de um serviço externo)
  if (relativePath.startsWith('http')) {
    return relativePath;
  }

  return `${backendOrigin}${relativePath}`;
};
