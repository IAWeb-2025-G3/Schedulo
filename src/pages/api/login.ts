import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ORGANIZERS_DIR } from '~/server/routers/organizerRouter';

const COOKIE_NAME = 'organizer_session';
export const SESSION_SECRET =
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ ok: false });
  }

  const files = await fs.readdir(ORGANIZERS_DIR);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = await fs.readFile(
        path.join(ORGANIZERS_DIR, file),
        'utf8',
      );
      const organizer = JSON.parse(content);
      if (organizer.username === username) {
        if (timingSafeEqual(organizer.password, password)) {
          const token = sign(organizer.id);
          res.setHeader(
            'Set-Cookie',
            `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${
              process.env.NODE_ENV === 'production' ? 'Secure;' : ''
            } Max-Age=${60 * 60 * 8}`, // 8 hours
          );

          return res.status(200).json({ ok: true });
        }
      }
    }
  }

  return res.status(401).json({ ok: false });
}
