import { CalendarCard } from '~/components/form/CalendarCard';
import type { NextPageWithLayout } from './_app';
import { EventCard } from '~/components/form/EventCard';
import { useForm } from '@mantine/form';
import { Button } from '@mantine/core';

type TimeSlot = {
  startTime: string;
  endTime: string;
};

export type Poll = {
  title: string;
  location: string;
  description: string;
  dates: Record<string, TimeSlot[]>;
};

const Page: NextPageWithLayout = () => {
  const form = useForm<Poll>({
    initialValues: {
      title: '',
      location: '',
      description: '',
      dates: {},
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => console.log(values))}
      className="flex flex-col py-8 w-fit gap-4"
    >
      <EventCard form={form} />
      <CalendarCard form={form} />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default Page;
