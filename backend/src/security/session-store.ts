import {hashRefreshToken} from './session.js';

type Query = (text: string, params?: any[]) => Promise<{rows: any[]}>;

export interface RotatedSessionUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  remember_me: boolean;
}

export const rotateRefreshSession = async (
  query: Query,
  currentToken: string,
  nextToken: string,
): Promise<RotatedSessionUser | null> => {
  const result = await query(`
    WITH revoked AS (
      UPDATE refresh_sessions
      SET revoked_at = NOW()
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
      RETURNING user_id, expires_at, remember_me
    ), inserted AS (
      INSERT INTO refresh_sessions (token_hash, user_id, expires_at, remember_me)
      SELECT $2, user_id, expires_at, remember_me FROM revoked
      RETURNING user_id, remember_me
    )
    SELECT u.id, u.username, u.name, u.email, u.role, u.avatar_url, inserted.remember_me
    FROM inserted JOIN users u ON u.id = inserted.user_id
  `, [hashRefreshToken(currentToken), hashRefreshToken(nextToken)]);

  return result.rows[0] ?? null;
};
