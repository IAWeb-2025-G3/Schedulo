import { useRouter } from 'next/router';
import type { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';
import { EventCardVote } from '~/components/VoteForm/EventCardVote';
import { CalendarCardVote } from '~/components/VoteForm/CalendarCardVote';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const fetchPoll = trpc.poll.fetchPoll.useQuery({
    id: router.query.id as string,
  });

  return (
    <div className="flex flex-col py-8 w-fit gap-4 min-w-96">
      {fetchPoll.data && <EventCardVote data={fetchPoll.data} />}
      {fetchPoll.data && <CalendarCardVote data={fetchPoll.data} />}
    </div>
  );
};

export default Page;
