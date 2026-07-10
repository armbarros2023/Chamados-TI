import {describe, expect, it} from 'vitest';
import {createOriginValidator, parseAllowedOrigins} from './cors-policy.js';

describe('política de CORS', () => {
  it('aceita uma allowlist separada por vírgulas sem duplicatas', () => {
    expect(parseAllowedOrigins('https://app.example.com, https://admin.example.com,https://app.example.com')).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });

  it('rejeita origens fora da allowlist e permite chamadas sem Origin', () => {
    const validate = createOriginValidator(['https://app.example.com']);
    const blocked: {error: Error | null} = {error: null};

    validate('https://evil.example', error => { blocked.error = error; });
    expect(blocked.error?.message).toMatch(/não permitida/i);
    expect(() => validate(undefined, error => { if (error) throw error; })).not.toThrow();
  });

  it('recusa valores que não são origens HTTP ou HTTPS', () => {
    expect(() => parseAllowedOrigins('file:///tmp/app')).toThrow(/origem inválida/i);
  });
});
