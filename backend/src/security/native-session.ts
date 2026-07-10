const NATIVE_CLIENT_HEADER = 'x-chamados-client';
const REFRESH_TOKEN_PATTERN = /^[A-Za-z0-9_-]{64}$/;

type RequestHeaders = Record<string, string | string[] | undefined>;

export const isNativeSessionRequest = (headers: RequestHeaders) => (
  !headers.origin && headers[NATIVE_CLIENT_HEADER] === 'desktop'
);

export const readNativeRefreshToken = (headers: RequestHeaders, body: unknown) => {
  if (!isNativeSessionRequest(headers) || !body || typeof body !== 'object') return null;
  const refreshToken = (body as {refreshToken?: unknown}).refreshToken;
  return typeof refreshToken === 'string' && REFRESH_TOKEN_PATTERN.test(refreshToken) ? refreshToken : null;
};
