import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.SECRET_KEY || 'your-super-secret-key-change-this';
const IMATO_SHARED_SECRET = process.env.IMATO_SHARED_SECRET || 'your-imato-shared-secret-change-this';
const ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '10080');

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * 验证 iMato 共享密钥签发的 Token
 * 用于 iMato 平台与 OpenMTSciEd 之间的跨系统认证
 */
export function verifyImatoToken(token: string): TokenPayload & { imatuUserId?: string } | null {
  try {
    return jwt.verify(token, IMATO_SHARED_SECRET) as TokenPayload & { imatuUserId?: string };
  } catch {
    return null;
  }
}

/**
 * 使用 iMato 共享密钥签发 Token
 */
export function generateImatoToken(payload: TokenPayload & { imatuUserId?: string }): string {
  return jwt.sign(payload, IMATO_SHARED_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
}

/**
 * 从请求头获取 Token
 */
export function getTokenFromHeader(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice(7);
}
