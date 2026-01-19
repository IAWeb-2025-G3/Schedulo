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
  Button,
  ActionIcon,
  ThemeIcon,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertCircle,
  IconChevronRight,
  IconLock,
  IconPlus,
} from '@tabler/icons-react';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '~/pages/_app';
import { formatDate } from '~/pages/organize/[id]/results';
import { usePreferences } from '~/components/layout/PreferenceProvider';
import { cn } from '~/components/PollForm/PollModal';

const Page: NextPageWithLayout = () => {
  const pollsQuery = trpc.poll.fetchPolls.useQuery();
  const { dateFormat } = usePreferences();

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
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="flex justify-between flex-nowrap items-center">
                <div style={{ minWidth: 0 }}>
                  <div className="flex gap-2 items-center">
                    <Text fw={600} lineClamp={1}>
                      {poll.title}
                    </Text>
                    <ThemeIcon
                      size="xs"
                      variant={poll.closedAt ? 'transparent' : 'light'}
                      title="Closed"
                      radius="lg"
                      className={cn(poll.closedAt ? '' : 'animate-pulse')}
                      color={poll.closedAt ? undefined : 'green'}
                    >
                      {poll.closedAt ? <IconLock /> : <IconActivity />}
                    </ThemeIcon>
                  </div>

                  <Text c="dimmed" size="xs" mt={2}>
                    Created {formatDate(poll.createdAt, dateFormat)}
                  </Text>

                  {(poll.location || poll.description) && (
                    <Text c="dimmed" size="sm" lineClamp={2} mt={6}>
                      {poll.location ?? poll.description}
                    </Text>
                  )}
                </div>

                <ActionIcon
                  title="View Poll Results"
                  variant="light"
                  radius="xl"
                  size="lg"
                  component={Link as any}
                  href={`/organize/${poll.id}/results`}
                >
                  <IconChevronRight size={18} />
                </ActionIcon>
              </div>
            </Paper>
          ))}
      </Stack>
    </Container>
  );
};

export default Page;
