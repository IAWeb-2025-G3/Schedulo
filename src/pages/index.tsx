import { Card, Text, Group, Title, Container, SimpleGrid } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconSettings, IconCalendarEvent } from '@tabler/icons-react';
import { NextPageWithLayout } from '~/pages/_app';

const Page: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Container size="sm" mt="xl">
      <Title order={1} ta="center" mb="xl">
        Welcome
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* Admin Card */}
        <Card
          shadow="md"
          padding="xl"
          radius="md"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/admin')}
        >
          <Group mb="sm">
            <IconSettings size={28} />
            <Text size="lg" fw={500}>
              Admin
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            Create and manage organizer accounts.
          </Text>
        </Card>

        {/* Organize Card */}
        <Card
          shadow="md"
          padding="xl"
          radius="md"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/organize')}
        >
          <Group mb="sm">
            <IconCalendarEvent size={28} />
            <Text size="lg" fw={500}>
              Organize
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            Create and manage polls, configure time slots, and share voting
            links.
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
};
export default Page;
