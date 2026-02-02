import z from 'zod';

export const ZodComment = z.object({
  userId: z.string(),
  comment: z.string(),
  name: z.string(),
});

export const ZodTimeSlot = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export type TimeSlot = z.infer<typeof ZodTimeSlot>;

export const ZodVoteValue = z.enum(['yes', 'no', 'ifNeedBe']);

export type VoteValue = z.infer<typeof ZodVoteValue>;
export const ZodVote = z.object({
  userId: z.string(),
  pollId: z.string(),
  name: z.string().min(1).max(60),
  timeSlotId: z.string(),
  value: ZodVoteValue.optional(),
  comment: z.string().optional(),
});
export const ZodPoll = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  dates: z.array(ZodTimeSlot),
  votes: z.array(ZodVote).optional(),
  createdAt: z.coerce.date(),
  organizerId: z.string(),
  closedAt: z.coerce.date().optional(),
  comment: ZodComment.array().optional(),
  active: z.boolean().optional(),
  winner: ZodTimeSlot.optional(),
});
export type Poll = z.infer<typeof ZodPoll>;

export type ZodVote = z.infer<typeof ZodVote>;
