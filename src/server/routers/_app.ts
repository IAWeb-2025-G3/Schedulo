/**
 * This file contains the root router of your tRPC-backend
 */
import { pollRouter } from '~/server/routers/pollRouter';
import { organizerRouter } from '~/server/routers/organizerRouter';
import { createCallerFactory, publicProcedure, router } from '../trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  poll: pollRouter,
  organizer: organizerRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
