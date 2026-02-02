import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ORGANIZERS_DIR } from '~/server/routers/organizerRouter';
import { env } from '~/server/env';
import bcrypt from 'bcryptjs';
import { makeAuthCookie } from '~/server/auth/cookie';

const COOKIE_NAME = 'organizer_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function sign(value: string) {
  const sig = crypto
    .createHmac('sha256', env.ORGANIZER_SESSION_SECRET)
    .update(value)
    .digest('base64url');
  return `${value}.${sig}`;
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
    if (!file.endsWith('.json')) continue;

    const content = await fs.readFile(path.join(ORGANIZERS_DIR, file), 'utf8');
    const organizer = JSON.parse(content);

    if (organizer.username !== username) continue;

    const ok = await bcrypt.compare(password, organizer.password);
    if (!ok) break;

    const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
    const token = sign(`${organizer.id}.${exp}`);

    res.setHeader('Set-Cookie', makeAuthCookie(COOKIE_NAME, token, MAX_AGE));
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
