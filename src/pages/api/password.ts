import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from '~/pages/api/login';
import { makeAuthCookie } from '~/server/auth/cookie';
import { env } from '~/server/env';

const PW_COOKIE = 'admin_session';
const MAX_AGE = 60 * 60 * 8;
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (password !== env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;

  const token = sign(String(exp));

  res.setHeader('Set-Cookie', makeAuthCookie(PW_COOKIE, token, MAX_AGE));
  return res.status(200).json({ ok: true });
}
