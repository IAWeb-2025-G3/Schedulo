import type * as trpcNext from '@trpc/server/adapters/next';
import { verifyOrgCookie, verifyAdminCookie } from '~/server/auth/organizerSession';
interface CreateContextOptions {
  organizerId: string | null;
  isAdmin: boolean;
}

/**
 * Inner function for `createContext` where we create the context.
 * Useful for testing.
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    organizerId: opts.organizerId,
    isAdmin: opts.isAdmin,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<Context> {
  // Check admin session
  const adminToken = opts.req.cookies.admin_session;
  const isAdmin = adminToken ? !!(await verifyAdminCookie(adminToken)) : false;

  // Check organizer session
  const organizerToken = opts.req.cookies.organizer_session;
  if (!organizerToken) {
    return await createContextInner({ organizerId: null, isAdmin });
  }
  const organizerId = await verifyOrgCookie(organizerToken);

  return await createContextInner({ organizerId: organizerId?.orgId || null, isAdmin });
}
