import {describe, expect, it} from 'vitest';
import {cleanText, isSupportedRole, validateEmail, validatePassword} from './validation.js';

describe('security validation', () => {
  it('rejeita senhas curtas ou sem diversidade', () => {
    expect(validatePassword('1234')).toBe(false);
    expect(validatePassword('senhamuitolonga')).toBe(false);
  });

  it('aceita senha forte', () => {
    expect(validatePassword('Chamados2026!')).toBe(true);
  });

  it('normaliza texto e aplica limite', () => {
    expect(cleanText('  assunto   importante  ', 30)).toBe('assunto importante');
    expect(() => cleanText('texto longo', 4)).toThrow('excede');
  });

  it('valida e-mail e funções permitidas', () => {
    expect(validateEmail('usuario@empresa.com')).toBe(true);
    expect(validateEmail('email-inválido')).toBe(false);
    expect(isSupportedRole('Administrador')).toBe(true);
    expect(isSupportedRole('Usuário')).toBe(true);
    expect(isSupportedRole('Superadmin')).toBe(false);
  });
});
