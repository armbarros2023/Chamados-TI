import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Response} from 'express';
import {hashRefreshToken, readCookie, setRefreshCookie} from './session.js';

const originalNodeEnv = process.env.NODE_ENV;
afterEach(() => { process.env.NODE_ENV = originalNodeEnv; });

describe('session helpers', () => {
  it('armazena somente hash do refresh token', () => {
    const token = 'segredo-aleatorio';
    const hash = hashRefreshToken(token);
    expect(hash).not.toContain(token);
    expect(hashRefreshToken(token)).toBe(hash);
  });

  it('lê cookie pelo nome sem confundir prefixos', () => {
    expect(readCookie('other=1; helpdesk_refresh=abc%20123', 'helpdesk_refresh')).toBe('abc 123');
    expect(readCookie('helpdesk_refresh_extra=x', 'helpdesk_refresh')).toBeNull();
  });

  it('mantém o cookie seguro em staging e produção', () => {
    process.env.NODE_ENV = 'staging';
    const response = {cookie: vi.fn()} as unknown as Response;

    setRefreshCookie(response, 'token', true);

    expect(response.cookie).toHaveBeenCalledWith('helpdesk_refresh', 'token', expect.objectContaining({secure: true}));
  });
});
