import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import type {Server} from 'node:http';

process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
process.env.CLIENT_URLS = 'https://staging.example.com';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const {createApp} = await import('./app.js');
  server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Servidor de teste sem porta TCP.');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => new Promise<void>((resolve, reject) => {
  if (!server) return resolve();
  server.close(error => error ? reject(error) : resolve());
}));

describe('versionamento da API', () => {
  it('expõe health check em /api/v1', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({status: 'ok', apiVersion: 'v1'});
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('não expõe a rota legada /api', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.status).toBe(404);
  });

  it('bloqueia uma origem fora da allowlist', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {headers: {Origin: 'https://evil.example'}});

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({message: 'Origem não permitida pela política de CORS.'});
  });
});
