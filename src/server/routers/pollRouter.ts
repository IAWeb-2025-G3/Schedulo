import { publicProcedure, router } from '~/server/trpc';
import { promises as fs } from 'fs';
import { Poll, ZodPoll } from '~/pages/organize/poll';
import path from 'path';
import crypto from 'crypto';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import { env } from '~/server/env';

const DATA_DIR = env.DATA_DIR ?? path.join(process.cwd(), 'data');
const POLLS_DIR = path.join(DATA_DIR, 'polls');
function pollPath(id: string) {
  return path.join(POLLS_DIR, `${id}.json`);
}
async function ensureDir() {
  await fs.mkdir(POLLS_DIR, { recursive: true });
}
export const pollRouter = router({
  storePoll: publicProcedure.input(ZodPoll).mutation(async ({ input, ctx }) => {
    if (!ctx.organizerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Organizer not authenticated',
      });
    }
    await ensureDir();
    const pollId = input.id ?? crypto.randomUUID();
    const full = {
      id: pollId,
      ...input,
      updatedAt: new Date().toISOString(),
      organizerId: ctx.organizerId,
    };
    const tmp = `${pollPath(pollId)}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(full, null, 2), 'utf8');
    await fs.rename(tmp, pollPath(pollId));
    return pollId;
  }),
  storeVotes: publicProcedure.input(ZodPoll).mutation(async ({ input }) => {
    await ensureDir();
    if (!input.id) {
      throw new Error('Poll ID is required to store votes');
    }
    const existingContent = await fs.readFile(pollPath(input.id), 'utf8');
    const existingPoll = ZodPoll.parse(JSON.parse(existingContent));
    const updatedPoll: Poll = {
      ...existingPoll,
      votes: [...(input.votes ?? []), ...(existingPoll.votes ?? [])],
    };
    const tmp = `${pollPath(input.id)}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(updatedPoll, null, 2), 'utf8');
    await fs.rename(tmp, pollPath(input.id));
    return input.id;
  }),
  fetchPolls: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.organizerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Organizer not authenticated',
      });
    }
    await ensureDir();
    const files = await fs.readdir(POLLS_DIR);
    const polls: Poll[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(POLLS_DIR, file), 'utf8');
        const poll = ZodPoll.parse(JSON.parse(content));
        if (poll.organizerId === ctx.organizerId) polls.push(poll);
      }
    }
    return polls;
  }),
  fetchPoll: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await ensureDir();
      const content = await fs.readFile(pollPath(input.id), 'utf8');
      const poll = ZodPoll.parse(JSON.parse(content));
      return poll;
    }),
  closePoll: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureDir();
      const content = await fs.readFile(pollPath(input.id), 'utf8');
      const poll = ZodPoll.parse(JSON.parse(content));
      const updatedPoll: Poll = {
        ...poll,
        closedAt: new Date(),
      };
      const tmp = `${pollPath(input.id)}.${crypto.randomBytes(6).toString('hex')}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(updatedPoll, null, 2), 'utf8');
      await fs.rename(tmp, pollPath(input.id));
      return input.id;
    }),
});
