import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const COOKIE_NAME = 'organizer_session';
const SESSION_SECRET =
  process.env.ORGANIZER_SESSION_SECRET || 'dev-secret-change-me';

function sign(value: string) {
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(value)
    .digest('base64url');
  return `${value}.${sig}`;
}

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ ok: false });
  }

  // Read JSON from disk (server-only)
  const filePath = path.join(process.cwd(), 'data', 'organizers.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as {
    organizers: { username: string; password: string }[];
  };

  const match = parsed.organizers.find((o) => o.username === username);

  if (!match || !timingSafeEqual(match.password, password)) {
    return res.status(401).json({ ok: false });
  }

  // Put minimal info in cookie (username), signed to prevent tampering
  const token = sign(username);

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${
      process.env.NODE_ENV === 'production' ? 'Secure;' : ''
    } Max-Age=${60 * 60 * 8}`, // 8 hours
  );

  return res.status(200).json({ ok: true });
}
