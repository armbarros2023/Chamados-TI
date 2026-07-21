import {afterEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  fetch: vi.fn(),
  platform: 'web',
  secureSave: vi.fn(),
  secureLoad: vi.fn(),
  secureClear: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({invoke: mocks.invoke}));
vi.mock('@tauri-apps/plugin-http', () => ({fetch: mocks.fetch}));
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => mocks.platform,
    isNativePlatform: () => mocks.platform !== 'web',
  },
  registerPlugin: () => ({save: mocks.secureSave, load: mocks.secureLoad, clear: mocks.secureClear}),
}));

import {
  clearDesktopRefreshToken,
  desktopRequest,
  isDesktopRuntime,
  isIosRuntime,
  isInstalledRuntime,
  loadDesktopRefreshToken,
  saveDesktopRefreshToken,
} from '../services/desktopSession';

afterEach(() => {
  vi.clearAllMocks();
  mocks.platform = 'web';
  delete (window as Window & {__TAURI_INTERNALS__?: unknown}).__TAURI_INTERNALS__;
});

describe('sessão desktop Tauri', () => {
  it('detecta o runtime sem confundir o navegador comum', () => {
    expect(isDesktopRuntime()).toBe(false);
    (window as Window & {__TAURI_INTERNALS__?: unknown}).__TAURI_INTERNALS__ = {};
    expect(isDesktopRuntime()).toBe(true);
  });

  it('reconhece o Android nativo como aplicativo instalado', () => {
    mocks.platform = 'android';

    expect(isDesktopRuntime()).toBe(false);
    expect(isInstalledRuntime()).toBe(true);
  });

  it('reconhece o iOS nativo como aplicativo instalado e usa o cofre de sessão', async () => {
    mocks.platform = 'ios';
    mocks.secureLoad.mockResolvedValueOnce({refreshToken: 'refresh-ios'});

    expect(isIosRuntime()).toBe(true);
    expect(isInstalledRuntime()).toBe(true);
    await saveDesktopRefreshToken('refresh-ios');
    await expect(loadDesktopRefreshToken()).resolves.toBe('refresh-ios');
    await clearDesktopRefreshToken();

    expect(mocks.secureSave).toHaveBeenCalledWith({refreshToken: 'refresh-ios'});
    expect(mocks.secureClear).toHaveBeenCalledOnce();
  });

  it('restringe a requisição nativa ao cabeçalho público do cliente desktop', async () => {
    mocks.fetch.mockResolvedValue(new Response(null, {status: 204}));

    await desktopRequest('https://chamados-staging.arbtechinfo.com.br/api/v1/health', {
      headers: {'X-Test': 'ok'},
    });

    const [, options] = mocks.fetch.mock.calls[0];
    expect(new Headers(options.headers).get('X-Chamados-Client')).toBe('desktop');
    expect(new Headers(options.headers).get('X-Test')).toBe('ok');
  });

  it('delega persistência do refresh token ao Keychain nativo', async () => {
    mocks.invoke.mockResolvedValueOnce(undefined).mockResolvedValueOnce('refresh-seguro').mockResolvedValueOnce(undefined);

    await saveDesktopRefreshToken('refresh-seguro');
    await expect(loadDesktopRefreshToken()).resolves.toBe('refresh-seguro');
    await clearDesktopRefreshToken();

    expect(mocks.invoke.mock.calls).toEqual([
      ['save_refresh_token', {refreshToken: 'refresh-seguro'}],
      ['load_refresh_token'],
      ['clear_refresh_token'],
    ]);
  });

  it('delega a sessão Android ao plugin protegido pelo Keystore', async () => {
    mocks.platform = 'android';
    mocks.secureLoad.mockResolvedValueOnce({refreshToken: 'refresh-android'});

    await saveDesktopRefreshToken('refresh-android');
    await expect(loadDesktopRefreshToken()).resolves.toBe('refresh-android');
    await clearDesktopRefreshToken();

    expect(mocks.secureSave).toHaveBeenCalledWith({refreshToken: 'refresh-android'});
    expect(mocks.secureClear).toHaveBeenCalledOnce();
  });
});
