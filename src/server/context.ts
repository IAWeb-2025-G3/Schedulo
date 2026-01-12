import type * as trpcNext from '@trpc/server/adapters/next';
import { verifyOrganizerCookie } from '~/server/auth/organizerSession';
interface CreateContextOptions {
  organizerId: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * Useful for testing.
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    organizerId: opts.organizerId,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<Context> {
  // NextApiRequest in Pages Router has parsed cookies here:
  const token = opts.req.cookies.organizer_session;
  const organizerId = verifyOrganizerCookie(token);

  return await createContextInner({ organizerId });
}
