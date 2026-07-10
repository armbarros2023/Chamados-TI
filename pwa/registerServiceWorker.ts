export const registerServiceWorker = (
  browserNavigator: Navigator = navigator,
  browserWindow: Window = window,
) => {
  const nativeWindow = browserWindow as Window & {
    Capacitor?: {isNativePlatform?: () => boolean};
  };
  const isCapacitorNative = nativeWindow.Capacitor?.isNativePlatform?.() === true;

  if ('__TAURI_INTERNALS__' in browserWindow || isCapacitorNative || !('serviceWorker' in browserNavigator)) return;

  browserWindow.addEventListener('load', () => {
    void browserNavigator.serviceWorker.register('/sw.js', { scope: '/' });
  }, { once: true });
};
