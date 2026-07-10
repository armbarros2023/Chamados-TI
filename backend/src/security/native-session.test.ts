import {describe, expect, it} from 'vitest';
import {isNativeSessionRequest, readNativeRefreshToken} from './native-session.js';

describe('transporte de sessão nativa', () => {
  it('aceita o cliente desktop somente quando não existe origem web', () => {
    expect(isNativeSessionRequest({'x-chamados-client': 'desktop'})).toBe(true);
    expect(isNativeSessionRequest({'x-chamados-client': 'desktop', origin: 'https://evil.example'})).toBe(false);
  });

  it('recusa clientes e tokens fora do contrato', () => {
    expect(isNativeSessionRequest({'x-chamados-client': 'browser'})).toBe(false);
    expect(readNativeRefreshToken({'x-chamados-client': 'desktop'}, {refreshToken: 'curto'})).toBeNull();
  });

  it('lê refresh token nativo válido sem aceitar origem web', () => {
    const refreshToken = 'a'.repeat(64);

    expect(readNativeRefreshToken({'x-chamados-client': 'desktop'}, {refreshToken})).toBe(refreshToken);
    expect(readNativeRefreshToken(
      {'x-chamados-client': 'desktop', origin: 'https://chamados-staging.arbtechinfo.com.br'},
      {refreshToken},
    )).toBeNull();
  });
});
