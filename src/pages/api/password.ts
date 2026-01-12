import type { NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = process.env.PASSWORD_COOKIE_NAME || 'pw_gate';
const PASSWORD = process.env.ADMIN_PASSWORD || '';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { password } = req.body || {};

  if (!PASSWORD || password !== PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=ok; Path=/; HttpOnly; SameSite=Lax; ${
      process.env.NODE_ENV === 'production' ? 'Secure;' : ''
    } Max-Age=${60 * 60 * 24}`,
  );

  res.status(200).json({ ok: true });
}
