import { CalendarCardPoll } from '~/components/PollForm/CalendarCardPoll';
import type { NextPageWithLayout } from './_app';
import { EventCardPoll } from '~/components/PollForm/EventCardPoll';
import { useForm } from '@mantine/form';
import { Button } from '@mantine/core';
import z from 'zod';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';

export const ZodTimeSlot = {
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
};

export type TimeSlot = z.infer<typeof ZodTimeSlot>;

export const ZodVoteValue = z.enum(['yes', 'no', 'ifNeedBe']);
export const ZodVote = z.object({
  pollId: z.string(),
  name: z.string().min(1).max(60),
  timeSlotId: z.string(),
  value: ZodVoteValue,
});
export const ZodPoll = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  dates: z.array(z.object(ZodTimeSlot)),
  votes: z.array(ZodVote).optional(),
});
export type Poll = z.infer<typeof ZodPoll>;

export type ZodVote = z.infer<typeof ZodVote>;

const Page: NextPageWithLayout = () => {
  const form = useForm<Poll>({
    initialValues: {
      title: '',
      location: '',
      description: '',
      dates: [],
      votes: undefined,
    },
  });

  const storePoll = trpc.poll.storePoll.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Poll saved successfully',
        color: 'green',
      });
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to save poll: ${error.message}`,
        color: 'red',
      });
    },
  });

  const handleSubmit = (values: Poll) => {
    storePoll.mutate(values);
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => handleSubmit(values))}
      className="flex flex-col py-8 w-fit gap-4 min-w-96"
    >
      <EventCardPoll form={form} />
      <CalendarCardPoll form={form} />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default Page;
