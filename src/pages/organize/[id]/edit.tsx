import * as React from 'react';
import { CalendarCardPoll } from '~/components/PollForm/CalendarCardPoll';
import type { NextPageWithLayout } from '../../_app';
import { EventCardPoll } from '~/components/PollForm/EventCardPoll';
import { useForm } from '@mantine/form';
import {
  ActionIcon,
  Button,
  Text,
  Title,
  Loader,
  Alert,
  Stack,
  Tooltip,
} from '@mantine/core';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconSend, IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { Poll } from '~/server/routers/schemas';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: poll,
    isLoading,
    error,
  } = trpc.poll.fetchPoll.useQuery({ id: id as string }, { enabled: !!id });

  const form = useForm<Poll>({
    initialValues: {
      id: '',
      title: '',
      location: '',
      description: '',
      dates: [],
      votes: [],
      createdAt: new Date(),
      organizerId: '',
    },
  });

  // Update form when poll data loads
  React.useEffect(() => {
    if (poll) {
      form.setValues({
        id: poll.id,
        title: poll.title,
        location: poll.location || '',
        description: poll.description || '',
        dates: poll.dates || [],
        votes: poll.votes,
        createdAt: poll.createdAt,
        organizerId: poll.organizerId,
        closedAt: poll.closedAt,
        comment: poll.comment,
      });
    }
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll]);

  const storePoll = trpc.poll.storePoll.useMutation({
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Poll updated successfully!',
        color: 'green',
      });
      router.push(`/organize/${data}/results`);
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

  if (!id) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Missing Poll ID"
        color="red"
      >
        No poll ID provided in the URL.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Stack align="center" gap="md" py="xl">
        <Loader size="lg" />
        <Text c="dimmed">Loading poll...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error.message}
      </Alert>
    );
  }

  if (!poll) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Poll Not Found"
        color="orange"
      >
        The poll you're looking for doesn't exist.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => handleSubmit(values))}
      className="flex flex-col py-8 w-fit gap-4"
    >
      <div>
        <div className="flex gap-4 items-center">
          <ActionIcon
            size="lg"
            variant="light"
            onClick={() => router.back()}
            title="Go back"
          >
            <IconArrowLeft />
          </ActionIcon>
          <Title order={1}>Edit Poll</Title>
        </div>
        <Text c="dimmed" size="sm">
          Update the poll details and time slots
        </Text>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <EventCardPoll form={form} />
        <CalendarCardPoll form={form} />
      </div>
      <Tooltip
        color="yellow"
        disabled={
          form.values.title.trim() !== '' && form.values.dates.length > 0
        }
        label={
          <Text>
            {!form.values.title.trim()
              ? 'Please enter a title!'
              : 'Please add at least one time slot!'}
          </Text>
        }
        openDelay={500}
        withArrow
      >
        <Button
          type="submit"
          leftSection={<IconSend size={16} />}
          loading={storePoll.isPending}
          disabled={!form.values.title.trim() || form.values.dates.length === 0}
        >
          Save Changes
        </Button>
      </Tooltip>
    </form>
  );
};

export default Page;
