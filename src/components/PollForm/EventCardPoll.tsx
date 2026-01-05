import { Card, Title, Space, TextInput, Textarea, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Poll } from '~/pages';

type Props = {
  form: UseFormReturnType<Poll, (values: Poll) => Poll>;
};

export const EventCardPoll = ({ form }: Props) => {
  return (
    <Card withBorder>
      <div className="flex flex-col">
        <Title order={3}>Event</Title>
        <Text>Describe what your event is about</Text>
      </div>
      <Space h="md" />
      <Card.Section>
        <div className="flex flex-col gap-2 p-4">
          <TextInput
            label="Title"
            required
            placeholder="IAWEB Weekly Meeting"
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Location"
            placeholder="Infeldgasse 16b"
            {...form.getInputProps('location')}
          />
          <Textarea
            label="Description"
            resize="vertical"
            placeholder="Project Progression Presentation"
            {...form.getInputProps('description')}
          />
        </div>
      </Card.Section>
    </Card>
  );
};
