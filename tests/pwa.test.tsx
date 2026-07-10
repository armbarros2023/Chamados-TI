import { describe, expect, it, vi } from 'vitest';
import { registerServiceWorker } from '../pwa/registerServiceWorker';

describe('registro da PWA', () => {
  it('registra o service worker após o carregamento da janela', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    const addEventListener = vi.fn((_event: string, callback: () => void) => callback());

    registerServiceWorker(
      { serviceWorker: { register } } as unknown as Navigator,
      { addEventListener } as unknown as Window,
    );

    expect(addEventListener).toHaveBeenCalledWith('load', expect.any(Function), { once: true });
    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('não tenta registrar quando o navegador não oferece service worker', () => {
    const addEventListener = vi.fn();

    registerServiceWorker({} as Navigator, { addEventListener } as unknown as Window);

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('não registra service worker dentro do aplicativo Tauri', () => {
    const addEventListener = vi.fn();
    const desktopWindow = {addEventListener, __TAURI_INTERNALS__: {}} as unknown as Window;

    registerServiceWorker({serviceWorker: {register: vi.fn()}} as unknown as Navigator, desktopWindow);

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('não registra service worker dentro do aplicativo Android', () => {
    const addEventListener = vi.fn();
    const androidWindow = {addEventListener, Capacitor: {isNativePlatform: () => true}} as unknown as Window;

    registerServiceWorker({serviceWorker: {register: vi.fn()}} as unknown as Navigator, androidWindow);

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
