import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {NextFunction, Request, Response} from 'express';

process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('../db.js', () => ({default: {query: mocks.query}}));
vi.mock('bcrypt', () => ({default: {compare: mocks.compare}}));

const {login, logout, refresh} = await import('./auth.controller.js');

const user = {
  id: 'user-1',
  username: 'admin',
  name: 'Administrador',
  email: 'admin@example.com',
  role: 'Administrador',
  password_hash: 'hash',
};

const createResponse = () => {
  const response = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  response.send.mockReturnValue(response);
  return response;
};

describe('login por tipo de cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.compare.mockResolvedValue(true);
    mocks.query.mockResolvedValueOnce({rows: [user]}).mockResolvedValueOnce({rows: []});
  });

  it('entrega o refresh token rotativo ao cliente desktop sem criar cookie', async () => {
    const request = {
      body: {username: 'admin', password: 'senha', rememberMe: true},
      headers: {'x-chamados-client': 'desktop'},
    } as unknown as Request;
    const response = createResponse();

    await login(request, response as unknown as Response, vi.fn() as NextFunction);

    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String),
      refreshToken: expect.stringMatching(/^[A-Za-z0-9_-]{64}$/),
    }));
  });

  it('mantém o refresh token fora do JSON no navegador', async () => {
    const request = {
      body: {username: 'admin', password: 'senha', rememberMe: true},
      headers: {origin: 'https://chamados-staging.arbtechinfo.com.br'},
    } as unknown as Request;
    const response = createResponse();

    await login(request, response as unknown as Response, vi.fn() as NextFunction);

    expect(response.cookie).toHaveBeenCalledOnce();
    expect(response.json).toHaveBeenCalledWith(expect.not.objectContaining({refreshToken: expect.anything()}));
  });
});

describe('rotação e encerramento da sessão desktop', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rotaciona o refresh token desktop e devolve somente o próximo token', async () => {
    const currentRefreshToken = 'a'.repeat(64);
    mocks.query.mockResolvedValueOnce({rows: [{...user, remember_me: true}]});
    const request = {
      body: {refreshToken: currentRefreshToken},
      headers: {'x-chamados-client': 'desktop'},
    } as unknown as Request;
    const response = createResponse();

    await refresh(request, response as unknown as Response, vi.fn() as NextFunction);

    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String),
      refreshToken: expect.stringMatching(/^[A-Za-z0-9_-]{64}$/),
    }));
    expect(response.json.mock.calls[0][0].refreshToken).not.toBe(currentRefreshToken);
  });

  it('revoga a sessão desktop sem manipular cookies do navegador', async () => {
    const refreshToken = 'b'.repeat(64);
    mocks.query.mockResolvedValueOnce({rows: []});
    const request = {
      body: {refreshToken},
      headers: {'x-chamados-client': 'desktop'},
    } as unknown as Request;
    const response = createResponse();

    await logout(request, response as unknown as Response, vi.fn() as NextFunction);

    expect(mocks.query).toHaveBeenCalledWith(expect.stringMatching(/UPDATE refresh_sessions/), expect.any(Array));
    expect(response.clearCookie).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(204);
  });
});
