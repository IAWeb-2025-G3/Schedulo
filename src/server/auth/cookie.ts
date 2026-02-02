import { serialize } from 'cookie';
import { env } from '~/server/env';

type CookieName = 'admin_session' | 'organizer_session';

const isProd = env.NODE_ENV === 'production';

export function makeAuthCookie(
  name: CookieName,
  value: string,
  maxAgeSeconds: number,
) {
  return serialize(name, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}
