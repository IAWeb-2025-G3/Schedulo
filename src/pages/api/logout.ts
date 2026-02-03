import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '~/server/env';

const ORGANIZER_COOKIE = 'organizer_session';
const ADMIN_COOKIE = 'admin_session';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Clear both cookies
  const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; ${
    env.NODE_ENV === 'production' ? 'Secure;' : ''
  } Max-Age=0`;

  res.setHeader('Set-Cookie', [
    `${ORGANIZER_COOKIE}=; ${cookieOptions}`,
    `${ADMIN_COOKIE}=; ${cookieOptions}`,
  ]);

  res.status(200).json({ ok: true });
}
