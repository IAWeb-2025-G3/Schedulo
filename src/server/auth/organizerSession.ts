import crypto from 'crypto';
import { SESSION_SECRET } from '~/pages/api/login';

export function verifyOrganizerCookie(token?: string): string | null {
  if (!token || !SESSION_SECRET) return null;

  const [value, sig] = token.split('.');
  if (!value || !sig) return null;

  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(value)
    .digest('base64url');

  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }

  return value;
}
