import {describe, expect, it, vi} from 'vitest';
import {rotateRefreshSession} from './session-store.js';
import {hashRefreshToken} from './session.js';

describe('rotação de refresh session', () => {
  it('revoga o token atual e cria o próximo em uma única consulta', async () => {
    const row = {id: 'user-1', username: 'admin', remember_me: true};
    const query = vi.fn().mockResolvedValue({rows: [row]});

    const result = await rotateRefreshSession(query, 'token-atual', 'proximo-token');

    expect(result).toEqual(row);
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/UPDATE refresh_sessions[\s\S]+INSERT INTO refresh_sessions/i);
    expect(params).toEqual([hashRefreshToken('token-atual'), hashRefreshToken('proximo-token')]);
    expect(params).not.toContain('token-atual');
  });

  it('recusa replay quando a sessão antiga já não pode ser rotacionada', async () => {
    const query = vi.fn().mockResolvedValue({rows: []});

    await expect(rotateRefreshSession(query, 'token-repetido', 'novo-token')).resolves.toBeNull();
  });
});
