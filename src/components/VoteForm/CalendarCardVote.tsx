import {
  Card,
  Title,
  Space,
  Text,
  ActionIcon,
  Button,
  TextInput,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Poll, VoteValue } from '~/pages/organize/poll';
import dayjs from 'dayjs';
import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useRouter } from 'next/router';
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
    },
  });

  const [name, setName] = useState('');
  const router = useRouter();

  const handleConfirmation = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({ pollId: data.id!, name: '', timeSlotId: id, value: 'yes' });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'yes',
        };
      }
      return next;
    });
  };
  const handleRejection = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({ pollId: data.id!, name: '', timeSlotId: id, value: 'no' });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'no',
        };
      }
      return next;
    });
  };

  const handleUndecided = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'ifNeedBe',
        });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'ifNeedBe',
        };
      }
      return next;
    });
  };

  const handleButtonStyle = (slotId: string, value: VoteValue) => {
    return form.values.votes?.find((vote) => vote.timeSlotId === slotId)
      ?.value === value
      ? 'filled'
      : 'subtle';
  };
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
    };

    try {
      await storeVotes.mutateAsync(payload);
      await router.push(`/poll/${data.id}/results`);
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
          label="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </Card>
      <Card withBorder>
        <div className="flex flex-col">
          <Title order={3}>Calendar</Title>
          <Text>Vote for available timeslots for this event</Text>
        </div>

        <Space h="md" />

        <Card.Section>
          <div className="flex gap-2 p-4 justify-center">
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
                        <div className="flex gap-2 items-center" key={index}>
                          <Card withBorder className="!py-1">
                            <Text>{slot.startTime}</Text>
                          </Card>
                          -
                          <Card withBorder className="!py-1">
                            <Text>{slot.endTime}</Text>
                          </Card>
                          <div className="flex gap-1 items-center">
                            <ActionIcon
                              size="input-xs"
                              variant={handleButtonStyle(slot.id, 'yes')}
                              color="green"
                              onClick={() => handleConfirmation(slot.id)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="input-xs"
                              variant={handleButtonStyle(slot.id, 'no')}
                              color="red"
                              onClick={() => handleRejection(slot.id)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="input-xs"
                              variant={handleButtonStyle(slot.id, 'ifNeedBe')}
                              color="yellow"
                              onClick={() => handleUndecided(slot.id)}
                            >
                              <IconQuestionMark size={16} />
                            </ActionIcon>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </Card.Section>
      </Card>
      <Button
        type="submit"
        disabled={name.trim() === '' || storeVotes.isLoading}
        loading={storeVotes.isLoading}
      >
        Submit
      </Button>
    </form>
  );
};
