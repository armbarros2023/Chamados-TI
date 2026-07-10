import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  desktopRequest: vi.fn(),
  saveDesktopRefreshToken: vi.fn(),
  loadDesktopRefreshToken: vi.fn(),
  clearDesktopRefreshToken: vi.fn(),
  runtime: 'desktop',
}));

vi.mock('../services/desktopSession', () => ({
  isDesktopRuntime: () => mocks.runtime === 'desktop',
  isInstalledRuntime: () => mocks.runtime !== 'web',
  desktopRequest: mocks.desktopRequest,
  saveDesktopRefreshToken: mocks.saveDesktopRefreshToken,
  loadDesktopRefreshToken: mocks.loadDesktopRefreshToken,
  clearDesktopRefreshToken: mocks.clearDesktopRefreshToken,
}));

import {login, logoutSession, refreshSession, setAccessToken} from '../services/apiService';

const user = {
  id: 'user-1',
  username: 'admin',
  name: 'Administrador',
  email: 'admin@example.com',
  role: 'Administrador',
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {'Content-Type': 'application/json'},
});

describe('autenticação da API no desktop', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.runtime = 'desktop';
    setAccessToken(null);
  });

  it('salva no Keychain o refresh token entregue pelo login desktop', async () => {
    mocks.desktopRequest.mockResolvedValueOnce(jsonResponse({token: 'access-1', refreshToken: 'refresh-1', user}));

    await login('admin', 'senha', true);

    expect(mocks.saveDesktopRefreshToken).toHaveBeenCalledWith('refresh-1');
  });

  it('usa o mesmo contrato nativo no Android', async () => {
    mocks.runtime = 'android';
    mocks.desktopRequest.mockResolvedValueOnce(jsonResponse({token: 'access-android', refreshToken: 'refresh-android', user}));

    await login('admin', 'senha', true);

    expect(mocks.saveDesktopRefreshToken).toHaveBeenCalledWith('refresh-android');
  });

  it('carrega e substitui o refresh token ao renovar a sessão', async () => {
    mocks.loadDesktopRefreshToken.mockResolvedValueOnce('refresh-1');
    mocks.desktopRequest.mockResolvedValueOnce(jsonResponse({token: 'access-2', refreshToken: 'refresh-2', user}));

    await refreshSession();

    expect(JSON.parse(mocks.desktopRequest.mock.calls[0][1].body)).toEqual({refreshToken: 'refresh-1'});
    expect(mocks.saveDesktopRefreshToken).toHaveBeenCalledWith('refresh-2');
  });

  it('revoga a sessão remota antes de limpar o Keychain no logout', async () => {
    mocks.loadDesktopRefreshToken.mockResolvedValueOnce('refresh-2');
    mocks.desktopRequest.mockResolvedValueOnce(new Response(null, {status: 204}));

    await logoutSession();

    expect(JSON.parse(mocks.desktopRequest.mock.calls[0][1].body)).toEqual({refreshToken: 'refresh-2'});
    expect(mocks.clearDesktopRefreshToken).toHaveBeenCalledOnce();
  });
});
