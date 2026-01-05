import { Card, Title, Space, Text } from '@mantine/core';
import { Poll } from '~/pages';

type Props = {
  data: Poll;
};

export const EventCardVote = ({ data }: Props) => {
  return (
    <Card withBorder>
      <div className="flex flex-col">
        <Title order={3}>Event</Title>
        {/* <Text>Describe what your event is about</Text> */}
      </div>
      <Space h="md" />
      <Card.Section>
        <div className="flex flex-col gap-2 p-4">
          <Text>{data.title}</Text>
          {/* <TextInput
            label="Title"
            required
            placeholder="IAWEB Weekly Meeting"
            {...form.getInputProps('title')}
          /> */}
          {data.location && <Text>{data.location}</Text>}
          {/* <TextInput
            label="Location"
            placeholder="Infeldgasse 16b"
            {...form.getInputProps('location')}
          /> */}
          {data.description && <Text>{data.description}</Text>}
          {/* 
          <Textarea
            label="Description"
            resize="vertical"
            placeholder="Project Progression Presentation"
            {...form.getInputProps('description')}
          /> */}
        </div>
      </Card.Section>
    </Card>
  );
};
