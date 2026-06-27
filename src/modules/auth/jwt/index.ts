import * as jwtUtils from '@/shared/utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'ppds-erp-fallback-secret-key-123456';

export const signJwt = (payload: jwtUtils.JwtPayload) => jwtUtils.signJwt(payload, JWT_SECRET);
export const verifyJwt = (token: string) => jwtUtils.verifyJwt(token, JWT_SECRET);
