import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from '~/pages/api/login';
import { env } from '~/server/env';

const PW_COOKIE = 'admin_session';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { password } = req.body || {};

  if (password !== env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const token = sign(`${exp}`);

  res.setHeader(
    'Set-Cookie',
    `${PW_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; ${
      env.NODE_ENV === 'production' ? 'Secure;' : ''
    } Max-Age=${60 * 60 * 8}`,
  );

  res.status(200).json({ ok: true });
}
