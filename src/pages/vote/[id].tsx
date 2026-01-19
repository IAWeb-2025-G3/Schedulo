import { useRouter } from 'next/router';
import type { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { EventCardVote } from '~/components/VoteForm/EventCardVote';
import { CalendarCardVote } from '~/components/VoteForm/CalendarCardVote';
import { Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';

const Page: NextPageWithLayout = () => {
  const router = useRouter();

  const id = router.query.id as string | undefined;
  const fetchPoll = trpc.poll.fetchPoll.useQuery({
    id: id ?? '',
  });

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

  if (fetchPoll.data?.closedAt) {
    return (
      <div className="flex flex-col gap-2">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Poll Closed"
          color="yellow"
        >
          This poll has been closed and is no longer accepting votes.
        </Alert>
        <Button
          onClick={() => router.push('/')}
          leftSection={<IconArrowBack size={16} />}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row py-8 w-fit gap-4">
      {fetchPoll.data && <EventCardVote data={fetchPoll.data} />}
      {fetchPoll.data && <CalendarCardVote data={fetchPoll.data} />}
    </div>
  );
};

export default Page;
