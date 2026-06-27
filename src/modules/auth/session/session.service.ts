import { cookies, headers } from 'next/headers';
import { verifyJwt } from '../jwt';
import { UserSessionData } from '../types/auth.types';
import { cache } from 'react';
import { cacheProvider } from '@/infrastructure/cache/cache.provider';

export const validateSession = cache(async (token: string): Promise<UserSessionData | null> => {
  try {
    const payload = await verifyJwt(token);
    return payload as unknown as UserSessionData;
  } catch (error) {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<UserSessionData | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value; // legacy used session_token
  if (!token) return null;
  return validateSession(token);
});

export const requireAuth = cache(async (): Promise<UserSessionData> => {
  const session = await getCurrentUser();
  if (!session) throw new Error('Unauthorized');
  return session;
});
