import {createHash, randomBytes} from 'node:crypto';
import {Response} from 'express';

export const REFRESH_COOKIE = 'helpdesk_refresh';
export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const createRefreshToken = () => randomBytes(48).toString('base64url');
export const readCookie = (header: string | undefined, name: string) => {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
};
export const setRefreshCookie = (res: Response, token: string, rememberMe: boolean) => res.cookie(REFRESH_COOKIE, token, {
  httpOnly: true,
  secure: ['production', 'staging'].includes(process.env.NODE_ENV || ''),
  sameSite: 'strict',
  path: '/api',
  ...(rememberMe ? {maxAge: 30 * 24 * 60 * 60 * 1000} : {}),
});
export const clearRefreshCookie = (res: Response) => res.clearCookie(REFRESH_COOKIE, {path: '/api'});
