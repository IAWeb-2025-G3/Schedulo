import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Loader,
  Center,
  Alert,
  ThemeIcon,
  Button,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '~/pages/_app';

const Page: NextPageWithLayout = () => {
  const pollsQuery = trpc.poll.fetchPolls.useQuery();

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Polls</Title>
            <Text c="dimmed" size="sm">
              Select a poll to view details.
            </Text>
          </div>

          <Button
            component={Link}
            href="/organize/poll"
            leftSection={<IconPlus size={16} />}
          >
            Create poll
          </Button>
        </Group>

        {pollsQuery.isLoading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}

        {pollsQuery.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Could not load polls"
            color="red"
          >
            {pollsQuery.error.message}
          </Alert>
        )}

        {!pollsQuery.isLoading &&
          !pollsQuery.isError &&
          pollsQuery.data?.length === 0 && (
            <Paper withBorder p="lg" radius="md">
              <Text fw={500}>No polls found</Text>
              <Text c="dimmed" size="sm">
                Create a poll to see it listed here.
              </Text>
            </Paper>
          )}

        {!pollsQuery.isLoading &&
          !pollsQuery.isError &&
          pollsQuery.data?.map((poll) => (
            <Paper
              key={poll.id}
              withBorder
              radius="md"
              p="md"
              component={Link as any}
              href={`/poll/${poll.id}/results`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div style={{ minWidth: 0 }}>
                  <Text fw={600} lineClamp={1}>
                    {poll.title}
                  </Text>

                  <Text c="dimmed" size="xs" mt={2}>
                    Created {poll.createdAt.toLocaleDateString()}
                  </Text>

                  {(poll.location || poll.description) && (
                    <Text c="dimmed" size="sm" lineClamp={2} mt={6}>
                      {poll.location ?? poll.description}
                    </Text>
                  )}
                </div>

                <ThemeIcon variant="light" radius="xl" size="lg">
                  <IconChevronRight size={18} />
                </ThemeIcon>
              </Group>
            </Paper>
          ))}
      </Stack>
    </Container>
  );
};

export default Page;
