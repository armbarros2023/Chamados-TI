export const validatePassword = (password: string) =>
  password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

export const cleanText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') throw new Error('Valor textual inválido.');
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) throw new Error('Valor textual obrigatório.');
  if (cleaned.length > maxLength) throw new Error(`Texto excede o limite de ${maxLength} caracteres.`);
  return cleaned;
};
