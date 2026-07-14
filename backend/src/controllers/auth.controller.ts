import {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import {isNativeSessionRequest, readNativeRefreshToken} from '../security/native-session.js';
import {clearRefreshCookie, createRefreshToken, hashRefreshToken, readCookie, REFRESH_COOKIE, setRefreshCookie} from '../security/session.js';
import {rotateRefreshSession} from '../security/session-store.js';
import {cleanText, validatePassword} from '../security/validation.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL_ERROR: JWT_SECRET não está definido nas variáveis de ambiente.');
interface DbUser {id: string; username: string; name: string; email: string; role: string; avatar_url?: string; password_hash?: string}
const publicUser = (u: DbUser) => ({id: u.id, username: u.username, name: u.name, email: u.email, role: u.role, avatarUrl: u.avatar_url});
const accessToken = (u: DbUser) => jwt.sign({id: u.id}, JWT_SECRET, {expiresIn: '15m', issuer: 'chamados-ti', audience: 'chamados-ti-web'});
const createSession = async (res: Response, user: DbUser, rememberMe: boolean, nativeClient: boolean) => {
  const token = createRefreshToken();
  const hours = rememberMe ? 720 : 8;
  await db.query(`INSERT INTO refresh_sessions (token_hash, user_id, expires_at, remember_me) VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 hour'), $4)`, [hashRefreshToken(token), user.id, hours, rememberMe]);
  if (!nativeClient) setRefreshCookie(res, token, rememberMe);
  return token;
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {username, password, rememberMe = false} = req.body;
    if (!username || !password) return res.status(400).json({message: 'Usuário e senha são obrigatórios.'});
    const result = await db.query('SELECT id, username, name, email, role, password_hash, avatar_url FROM users WHERE username = $1', [username]);
    const user = result.rows[0] as DbUser | undefined;
    if (!user || !await bcrypt.compare(password, user.password_hash || '')) return res.status(401).json({message: 'Credenciais inválidas.'});
    const nativeClient = isNativeSessionRequest(req.headers);
    const refreshToken = await createSession(res, user, Boolean(rememberMe), nativeClient);
    res.status(200).json({
      token: accessToken(user),
      user: publicUser(user),
      ...(nativeClient ? {refreshToken} : {}),
    });
  } catch (error) { next(error); }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {username, name, email, password} = req.body;
    if ([username, name, email, password].some(value => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({message: 'Nome, usuário, e-mail e senha são obrigatórios.'});
    }
    if (typeof password !== 'string' || !validatePassword(password)) {
      return res.status(400).json({message: 'A senha deve ter 10 caracteres, incluindo maiúscula, minúscula e número.'});
    }

    const safeUsername = cleanText(username, 100);
    const safeName = cleanText(name, 255);
    const safeEmail = cleanText(email, 255).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return res.status(400).json({message: 'Informe um e-mail válido.'});
    }

    const existingUser = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [safeUsername, safeEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({message: 'Nome de usuário ou e-mail já cadastrado.'});
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, name, email, role, password_hash)
       VALUES ($1, $2, $3, 'Usuário', $4)
       RETURNING id, username, name, email, role, avatar_url`,
      [safeUsername, safeName, safeEmail, passwordHash],
    );
    return res.status(201).json(publicUser(result.rows[0] as DbUser));
  } catch (error) {
    if ((error as {code?: string})?.code === '23505') {
      return res.status(409).json({message: 'Nome de usuário ou e-mail já cadastrado.'});
    }
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nativeClient = isNativeSessionRequest(req.headers);
    const token = nativeClient
      ? readNativeRefreshToken(req.headers, req.body)
      : readCookie(req.headers.cookie, REFRESH_COOKIE);
    if (!token) return res.status(200).json({token: null, user: null, ...(nativeClient ? {refreshToken: null} : {})});
    const nextToken = createRefreshToken();
    const user = await rotateRefreshSession(db.query, token, nextToken);
    if (!user) {
      if (!nativeClient) clearRefreshCookie(res);
      return res.status(200).json({token: null, user: null, ...(nativeClient ? {refreshToken: null} : {})});
    }
    if (!nativeClient) setRefreshCookie(res, nextToken, user.remember_me);
    res.status(200).json({
      token: accessToken(user),
      user: publicUser(user),
      ...(nativeClient ? {refreshToken: nextToken} : {}),
    });
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nativeClient = isNativeSessionRequest(req.headers);
    const token = nativeClient
      ? readNativeRefreshToken(req.headers, req.body)
      : readCookie(req.headers.cookie, REFRESH_COOKIE);
    if (token) await db.query('UPDATE refresh_sessions SET revoked_at = NOW() WHERE token_hash = $1', [hashRefreshToken(token)]);
    if (!nativeClient) clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) { next(error); }
};
