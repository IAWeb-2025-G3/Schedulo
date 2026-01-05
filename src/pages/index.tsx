import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const Page: NextPageWithLayout = () => {
  const fetchPolls = trpc.poll.fetchPolls.useQuery();

  return (
    <div className="flex flex-col gap-4">
      {fetchPolls.data?.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  );
};

export default Page;
