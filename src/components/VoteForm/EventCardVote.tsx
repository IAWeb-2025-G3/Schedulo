import { Card, Title, Text } from '@mantine/core';
import { Poll } from '~/server/routers/schemas';

type Props = {
  data: Poll;
};

export const EventCardVote = ({ data }: Props) => {
  return (
    <Card withBorder>
      <div className="flex flex-col">
        <Title order={3}>{data.title}</Title>
      </div>
      {/* <Space h="md" /> */}
      <Card.Section>
        <div className="flex flex-col gap-2 p-4">
          {data.location ? (
            <Text>{data.location}</Text>
          ) : (
            <Text fs="italic">No location provided</Text>
          )}
          {data.description ? (
            <Text>{data.description}</Text>
          ) : (
            <Text fs="italic">No description provided</Text>
          )}
        </div>
      </Card.Section>
    </Card>
  );
};
