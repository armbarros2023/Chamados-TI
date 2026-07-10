import {afterEach, describe, expect, it, vi} from 'vitest';
import {getFullAvatarUrl} from '../utils';

afterEach(() => vi.unstubAllEnvs());

describe('URLs de arquivos da API', () => {
  it('remove toda a base /api/v1 antes de montar a URL do avatar', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://chamados-staging.arbtechinfo.com.br/api/v1');

    expect(getFullAvatarUrl('/avatars/avatar.png')).toBe(
      'https://chamados-staging.arbtechinfo.com.br/avatars/avatar.png',
    );
  });
});
