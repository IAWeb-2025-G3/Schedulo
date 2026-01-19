import { env } from '~/server/env';

function base64UrlToUint8Array(base64url: string) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : '';
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256Base64Url(message: string, secret: string) {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  );

  const bytes = new Uint8Array(sig);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function verifyOrgCookie(token?: string | null) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [orgId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!orgId || !Number.isFinite(exp) || !sig) return null;

  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return null;

  const payload = `${orgId}.${expStr}`;
  const expectedSig = await hmacSha256Base64Url(
    payload,
    env.ORGANIZER_SESSION_SECRET,
  );

  const a = base64UrlToUint8Array(sig);
  const b = base64UrlToUint8Array(expectedSig);
  if (!timingSafeEqualBytes(a, b)) return null;

  return { orgId, exp };
}

export async function verifyAdminCookie(token?: string | null) {
  if (!token) return null;

  const [value, sig] = token.split('.');
  if (!value || !sig) return null;

  const expectedSig = await hmacSha256Base64Url(
    value,
    env.ORGANIZER_SESSION_SECRET,
  );

  const a = base64UrlToUint8Array(sig);
  const b = base64UrlToUint8Array(expectedSig);
  if (!timingSafeEqualBytes(a, b)) return null;

  return value;
}
