import {describe, expect, it} from 'vitest';
import {validatePassword, cleanText} from './validation.js';

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
});
