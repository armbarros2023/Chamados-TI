import {invoke} from '@tauri-apps/api/core';
import {fetch as tauriFetch} from '@tauri-apps/plugin-http';
import {Capacitor, registerPlugin} from '@capacitor/core';

interface SecureSessionPlugin {
  save(options: {refreshToken: string}): Promise<void>;
  load(): Promise<{refreshToken?: string}>;
  clear(): Promise<void>;
}

const SecureSession = registerPlugin<SecureSessionPlugin>('SecureSession');

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isDesktopRuntime = () => typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
export const isAndroidRuntime = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
export const isInstalledRuntime = () => isDesktopRuntime() || isAndroidRuntime();

export const desktopRequest = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  headers.set('X-Chamados-Client', 'desktop');
  if (isAndroidRuntime()) return fetch(url, {...options, headers});
  return tauriFetch(url, {...options, headers});
};

export const saveDesktopRefreshToken = (refreshToken: string) => (
  isAndroidRuntime() ? SecureSession.save({refreshToken}) : invoke<void>('save_refresh_token', {refreshToken})
);

export const loadDesktopRefreshToken = async () => {
  if (!isAndroidRuntime()) return invoke<string | null>('load_refresh_token');
  const result = await SecureSession.load();
  return result.refreshToken ?? null;
};

export const clearDesktopRefreshToken = () => (
  isAndroidRuntime() ? SecureSession.clear() : invoke<void>('clear_refresh_token')
);
