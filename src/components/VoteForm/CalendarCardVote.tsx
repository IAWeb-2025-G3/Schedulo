import {
  Card,
  Title,
  Space,
  Text,
  Button,
  TextInput,
  Tooltip,
  Textarea,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Poll } from '~/pages/organize/poll';
import dayjs from 'dayjs';
import { IconArrowBack, IconSend } from '@tabler/icons-react';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { modals } from '@mantine/modals';
import { TimeSlotCard } from '~/components/VoteForm/TimeSlotcard';
type Props = {
  data: Poll;
};

export const CalendarCardVote = ({ data }: Props) => {
  const form = useForm<Poll>({
    initialValues: {
      id: data.id,
      title: data.title,
      location: data.location || '',
      description: data.description || '',
      dates: data.dates,
      votes: data.dates.map((slot) => ({
        pollId: data.id!,
        name: '',
        timeSlotId: slot.id,
        value: 'ifNeedBe',
      })),
      createdAt: data.createdAt,
      organizerId: data.organizerId,
    },
  });

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const router = useRouter();

  const storeVotes = trpc.poll.storeVotes.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: `Votes submitted successfully!`,
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: `Failed to submit votes: ${error.message}`,
        color: 'red',
      });
    },
  });

  const handleSubmit = async (values: Poll) => {
    const payload: Poll = {
      ...values,
      votes: form.values.votes?.map((vote) => ({ ...vote, name })),
      comment: comment.trim() ? [{ name, comment }] : [],
    };

    try {
      await storeVotes.mutateAsync(payload);
      modals.open({
        title: 'Votes Submitted',
        children: (
          <div className="flex flex-col gap-4">
            <Text>
              Thank you, <strong>{name}</strong>, for submitting your votes! You
              will be informed once the organizer finalizes the event details.
            </Text>
            <Button
              onClick={() => {
                modals.closeAll();
                router.push('/');
              }}
              leftSection={<IconArrowBack size={18} />}
            >
              Close
            </Button>
          </div>
        ),
        centered: true,
        closeOnClickOutside: false,
        closeOnEscape: false,
        withCloseButton: false,
      });
    } catch {}
  };

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await handleSubmit(values);
      })}
      className="flex flex-col gap-4"
    >
      <Card withBorder>
        <TextInput
          required
          placeholder="Enter your name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <Textarea
          label="Comment"
          placeholder="Add any additional comment here"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          resize="vertical"
        />
      </Card>
      <Card withBorder>
        <div className="flex flex-col">
          <Title order={3}>Calendar</Title>
          <Text>Vote for available timeslots for this event</Text>
        </div>

        <Space h="md" />

        <Card.Section>
          <div className="flex gap-2 p-4 justify-center flex-col md:flex-row">
            <Calendar
              getDayProps={(date) => {
                const dateString = dayjs(date).format('YYYY-MM-DD');
                return {
                  selected: data.dates.some((d) => d.date === dateString),
                  // onClick: () => handleSelect(date),
                };
              }}
            />

            <div className="flex flex-col gap-2">
              {form.values.dates
                .sort(
                  (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
                )
                .reduce(
                  (acc, slot) => {
                    const dateKey = slot.date;
                    let group = acc.find((g) => g.date === dateKey);
                    if (!group) {
                      group = { date: dateKey, slots: [] };
                      acc.push(group);
                    }
                    group.slots.push(slot);
                    return acc;
                  },
                  [] as {
                    date: string;
                    slots: (typeof form.values.dates)[0][];
                  }[],
                )
                .map((timeSlots) => (
                  <Card
                    withBorder
                    key={timeSlots.date}
                    className="flex gap-2 items-start flex-nowrap !flex-row !p-3"
                  >
                    <Card
                      withBorder
                      className="flex flex-col items-center !py-0 !px-2"
                    >
                      <Text>{dayjs(timeSlots.date).format('MMM')}</Text>
                      <Title order={3}>
                        {dayjs(timeSlots.date).format('DD')}
                      </Title>
                    </Card>
                    <div className="flex flex-col gap-2">
                      {timeSlots.slots.map((slot, index) => (
                        <TimeSlotCard
                          key={index}
                          slot={slot}
                          form={form}
                          data={data}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </Card.Section>
      </Card>
      <Tooltip
        color="yellow"
        disabled={name.trim() !== ''}
        label={<Text>Please enter your name!</Text>}
        openDelay={500}
        withArrow
      >
        <Button
          leftSection={<IconSend size={16} />}
          type="submit"
          disabled={name.trim() === '' || storeVotes.isPending}
          loading={storeVotes.isPending}
        >
          Submit
        </Button>
      </Tooltip>
    </form>
  );
};
