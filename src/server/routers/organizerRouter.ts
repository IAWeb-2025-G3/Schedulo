import { publicProcedure, router } from '~/server/trpc';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import z from 'zod';

const ZodOrganizer = z.object({
  id: z.string().optional(),
  username: z.string().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Organizer = z.infer<typeof ZodOrganizer>;

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const ORGANIZERS_DIR = path.join(DATA_DIR, 'organizers');

function organizerPath(id: string) {
  return path.join(ORGANIZERS_DIR, `${id}.json`);
}

async function ensureDir() {
  await fs.mkdir(ORGANIZERS_DIR, { recursive: true });
}

export const organizerRouter = router({
  createOrganizer: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, 'Username is required').max(100),
        password: z.string().min(1, 'Password is required'),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureDir();

      // Check if username already exists
      const files = await fs.readdir(ORGANIZERS_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(ORGANIZERS_DIR, file), 'utf8');
          const organizer = JSON.parse(content);
          if (organizer.username === input.username) {
            throw new Error('Username already exists');
          }
        }
      }

      const organizerId = crypto.randomUUID();
      const full: Organizer = {
        id: organizerId,
        username: input.username,
        password: input.password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tmp = `${organizerPath(organizerId)}.${crypto.randomBytes(6).toString('hex')}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(full, null, 2), 'utf8');
      await fs.rename(tmp, organizerPath(organizerId));
      return organizerId;
    }),

  updateOrganizer: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().min(1, 'Username is required').max(100).optional(),
        password: z.string().optional(), // Optional - if provided, must be at least 1 char
      }),
    )
    .mutation(async ({ input }) => {
      await ensureDir();

      if (!input.id) {
        throw new Error('Organizer ID is required');
      }

      const existingContent = await fs.readFile(organizerPath(input.id), 'utf8');
      const existingOrganizer = ZodOrganizer.parse(JSON.parse(existingContent));

      // Check if username is being changed and if it already exists
      if (input.username && input.username !== existingOrganizer.username) {
        const files = await fs.readdir(ORGANIZERS_DIR);
        for (const file of files) {
          if (file.endsWith('.json') && file !== `${input.id}.json`) {
            const content = await fs.readFile(path.join(ORGANIZERS_DIR, file), 'utf8');
            const organizer = JSON.parse(content);
            if (organizer.username === input.username) {
              throw new Error('Username already exists');
            }
          }
        }
      }

      const updatedOrganizer: Organizer = {
        ...existingOrganizer,
        ...(input.username && { username: input.username }),
        // Only update password if provided and not empty
        ...(input.password && input.password.length > 0 && { password: input.password }),
        updatedAt: new Date().toISOString(),
      };

      const tmp = `${organizerPath(input.id)}.${crypto.randomBytes(6).toString('hex')}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(updatedOrganizer, null, 2), 'utf8');
      await fs.rename(tmp, organizerPath(input.id));
      return input.id;
    }),

  deleteOrganizer: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureDir();
      await fs.unlink(organizerPath(input.id));
      return input.id;
    }),

  fetchOrganizers: publicProcedure.query(async () => {
    await ensureDir();
    const files = await fs.readdir(ORGANIZERS_DIR);
    const organizers: Organizer[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(ORGANIZERS_DIR, file), 'utf8');
        const organizer = ZodOrganizer.parse(JSON.parse(content));
        organizers.push(organizer);
      }
    }
    return organizers.sort((a, b) => {
      const aDate = a.createdAt ?? '';
      const bDate = b.createdAt ?? '';
      return bDate.localeCompare(aDate);
    });
  }),

  fetchOrganizer: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await ensureDir();
      const content = await fs.readFile(organizerPath(input.id), 'utf8');
      const organizer = ZodOrganizer.parse(JSON.parse(content));
      return organizer;
    }),
});

