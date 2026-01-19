/**
 * This file is included in `/next.config.ts` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */

import { z } from 'zod';

const server = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  ADMIN_PASSWORD: z.string().min(1),
  ORGANIZER_SESSION_SECRET: z.string().min(1),
  DATA_DIR: z.string().optional(),
});

const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ORGANIZER_SESSION_SECRET: process.env.ORGANIZER_SESSION_SECRET,
  DATA_DIR: process.env.DATA_DIR,
};

const merged = server.merge(client);
const isServer = typeof window === 'undefined';

const parsed = /** @type {MergedSafeParseReturn} */ isServer
  ? merged.safeParse(processEnv) // on server we can validate all env vars
  : client.safeParse(processEnv); // on client we can only validate the ones that are exposed

if (!parsed.success) {
  throw new Error(
    '❌ Invalid environment variables: ' +
      JSON.stringify(parsed.error.format(), null, 4),
  );
}
export const env = parsed.data;
