import * as React from 'react';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  Grid,
  Stack,
  Group,
  Loader,
  Alert,
  ScrollArea,
  Paper,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconQuestionMark,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

type VoteValue = 'yes' | 'no' | 'ifneedbe' | string;

function formatDate(dateString: string) {
  return dayjs(dateString).format('MMM DD, YYYY');
}

function VoteBadge({ value }: { value: VoteValue }) {
  const normalized = String(value).toLowerCase();
  if (normalized === 'yes') {
    return (
      <Badge color="green" leftSection={<IconCheck size={14} />}>
        Yes
      </Badge>
    );
  }
  if (normalized === 'no') {
    return (
      <Badge color="red" leftSection={<IconX size={14} />}>
        No
      </Badge>
    );
  }
  if (normalized === 'ifneedbe') {
    return (
      <Badge
        color="yellow"
        variant="light"
        leftSection={<IconQuestionMark size={14} />}
      >
        Maybe
      </Badge>
    );
  }
  return <Text c="dimmed">—</Text>;
}

export default function PollResultsPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const {
    data: poll,
    isLoading,
    error,
  } = trpc.poll.fetchPoll.useQuery({ id: id ?? '' }, { enabled: !!id });

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
        <Text c="dimmed">Loading poll results...</Text>
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

  const dates: Array<any> = Array.isArray(poll.dates) ? poll.dates : [];
  const votes: Array<any> = Array.isArray(poll.votes) ? poll.votes : [];

  const slotById = new Map<string, any>();
  for (const s of dates) {
    if (s?.id) slotById.set(String(s.id), s);
  }

  const resultsBySlot = new Map<
    string,
    {
      yes: number;
      ifneedbe: number;
      no: number;
      total: number;
      byName: Map<string, VoteValue>;
    }
  >();

  const ensureSlot = (slotId: string) => {
    const existing = resultsBySlot.get(slotId);
    if (existing) return existing;
    const fresh = {
      yes: 0,
      ifneedbe: 0,
      no: 0,
      total: 0,
      byName: new Map<string, VoteValue>(),
    };
    resultsBySlot.set(slotId, fresh);
    return fresh;
  };

  for (const v of votes) {
    const slotId = String(v?.timeSlotId ?? '');
    if (!slotId) continue;

    const name = String(v?.name ?? 'Anonymous');
    const value: VoteValue = String(v?.value ?? '').toLowerCase();

    const slotRes = ensureSlot(slotId);

    const prev = slotRes.byName.get(name);
    if (prev) {
      if (prev === 'yes') slotRes.yes -= 1;
      else if (prev === 'ifneedbe') slotRes.ifneedbe -= 1;
      else if (prev === 'no') slotRes.no -= 1;
    } else {
      slotRes.total += 1;
    }

    slotRes.byName.set(name, value);

    if (value === 'yes') slotRes.yes += 1;
    else if (value === 'ifneedbe') slotRes.ifneedbe += 1;
    else if (value === 'no') slotRes.no += 1;
  }

  const voters = Array.from(
    votes.reduce((set: Set<string>, v: any) => {
      const name = String(v?.name ?? 'Anonymous');
      set.add(name);
      return set;
    }, new Set<string>()),
  ).sort((a, b) => a.localeCompare(b));

  const sortedSlots = [...dates].sort((a, b) => {
    const ak = `${a?.date ?? ''} ${a?.startTime ?? ''}`;
    const bk = `${b?.date ?? ''} ${b?.startTime ?? ''}`;
    return ak.localeCompare(bk);
  });

  // Calculate winner - slot with most "yes" votes, then most "ifneedbe", then least "no"
  const winner = sortedSlots.reduce<{
    slot: any;
    score: number;
    stats: any;
  } | null>((best, slot) => {
    const slotId = String(slot?.id ?? '');
    const r = resultsBySlot.get(slotId) ?? {
      yes: 0,
      ifneedbe: 0,
      no: 0,
      total: 0,
      byName: new Map(),
    };

    // Score: prioritize yes votes, then ifneedbe, penalize no votes
    // Weight: yes = 3, ifneedbe = 1, no = -2
    const score = r.yes * 3 + r.ifneedbe * 1 - r.no * 2;

    if (!best || score > best.score) {
      return { slot, score, stats: r };
    }
    return best;
  }, null);

  return (
    <Stack gap="lg" className="w-full max-w-6xl py-8">
      <div>
        <Title order={1} mb="xs">
          Poll Results
        </Title>
        <Text c="dimmed" size="sm">
          View voting results and participant responses
        </Text>
      </div>

      {/* Poll Information Card */}
      <Card withBorder>
        <Stack gap="sm">
          <div>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              Title
            </Text>
            <Title order={3}>{poll.title ?? '(untitled)'}</Title>
          </div>

          {poll.location && (
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Location
              </Text>
              <Text>{poll.location}</Text>
            </div>
          )}

          {poll.description && (
            <div>
              <Text size="sm" fw={600} c="dimmed" mb={4}>
                Description
              </Text>
              <Text>{poll.description}</Text>
            </div>
          )}

          <Group gap="md" mt="sm">
            <Badge size="lg" variant="light">
              {voters.length} {voters.length === 1 ? 'Voter' : 'Voters'}
            </Badge>
            <Badge size="lg" variant="light">
              {sortedSlots.length} Time{' '}
              {sortedSlots.length === 1 ? 'Slot' : 'Slots'}
            </Badge>
          </Group>
        </Stack>
      </Card>

      {/* Winner Card */}
      {winner && winner.stats.total > 0 && (
        <Card withBorder padding="xl">
          <Stack gap="md">
            <Group gap="sm" align="center">
              <IconTrophy
                size={36}
                color="var(--mantine-color-yellow-6)"
                strokeWidth={2}
              />
              <div>
                <Title order={2} mb={4}>
                  Best Time Slot
                </Title>
                <Text c="dimmed" size="sm">
                  Based on voting results
                </Text>
              </div>
            </Group>

            <Divider />

            <Stack gap="xs">
              <Group gap="md" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Text size="sm" c="dimmed" mb={4}>
                    Date & Time
                  </Text>
                  <Text fw={700} size="xl">
                    {formatDate(winner.slot.date)}
                  </Text>
                  <Text fw={600} size="lg" mt={4}>
                    {winner.slot.startTime} – {winner.slot.endTime}
                  </Text>
                </div>

                <div style={{ flex: 1 }}>
                  <Text size="sm" c="dimmed" mb={8}>
                    Voting Breakdown
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    <Badge
                      size="lg"
                      color="green"
                      variant="filled"
                      leftSection={<IconCheck size={16} />}
                    >
                      {winner.stats.yes} Yes
                    </Badge>
                    <Badge
                      size="lg"
                      color="yellow"
                      variant="filled"
                      leftSection={<IconQuestionMark size={16} />}
                    >
                      {winner.stats.ifneedbe} Maybe
                    </Badge>
                    {winner.stats.no > 0 && (
                      <Badge
                        size="lg"
                        color="red"
                        variant="filled"
                        leftSection={<IconX size={16} />}
                      >
                        {winner.stats.no} No
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed" mt={8}>
                    {winner.stats.total}{' '}
                    {winner.stats.total === 1 ? 'vote' : 'votes'} total
                  </Text>
                </div>
              </Group>
            </Stack>
          </Stack>
        </Card>
      )}

      {(!winner || winner.stats.total === 0) && (
        <Card withBorder padding="lg">
          <Group gap="sm">
            <IconAlertCircle size={20} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">
              No votes yet. The winner will be displayed once participants start
              voting.
            </Text>
          </Group>
        </Card>
      )}

      {/* Summary cards per slot */}
      <div>
        <Title order={2} mb="md">
          Time Slots Summary
        </Title>
        <Grid gutter="md">
          {sortedSlots.map((slot) => {
            const slotId = String(slot?.id ?? '');
            const r = resultsBySlot.get(slotId) ?? {
              yes: 0,
              ifneedbe: 0,
              no: 0,
              total: 0,
              byName: new Map(),
            };
            const best = Math.max(r.yes, r.ifneedbe, r.no);
            const bestLabel =
              best === r.yes
                ? 'yes'
                : best === r.ifneedbe
                  ? 'ifneedbe'
                  : best === r.no
                    ? 'no'
                    : '';

            return (
              <Grid.Col key={slotId} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder padding="lg" h="100%">
                  <Stack gap="sm">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        {formatDate(slot.date)}
                      </Text>
                      <Text fw={700} size="lg">
                        {slot.startTime} – {slot.endTime}
                      </Text>
                    </div>

                    <Divider />

                    <Group gap="xs" wrap="wrap">
                      <Badge color="green" variant="light">
                        Yes: {r.yes}
                      </Badge>
                      <Badge color="yellow" variant="light">
                        Maybe: {r.ifneedbe}
                      </Badge>
                      <Badge color="red" variant="light">
                        No: {r.no}
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {r.total} {r.total === 1 ? 'vote' : 'votes'} total
                    </Text>

                    {r.total > 0 ? (
                      <Paper
                        p="xs"
                        withBorder
                        bg="dimmed"
                        style={{
                          backgroundColor: 'var(--mantine-color-dark-6)',
                        }}
                      >
                        <Text size="sm" fw={500}>
                          Most common:{' '}
                          <Text
                            span
                            c={
                              bestLabel === 'yes'
                                ? 'green'
                                : bestLabel === 'ifneedbe'
                                  ? 'yellow'
                                  : 'red'
                            }
                          >
                            {bestLabel === 'yes'
                              ? 'Yes'
                              : bestLabel === 'ifneedbe'
                                ? 'Maybe'
                                : 'No'}
                          </Text>
                        </Text>
                      </Paper>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">
                        No votes for this slot yet.
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </div>

      {/* Detailed matrix */}
      <div>
        <Title order={2} mb="md">
          Votes Matrix
        </Title>

        {voters.length === 0 ? (
          <Card withBorder>
            <Text c="dimmed" ta="center" py="md">
              No votes yet. Be the first to vote!
            </Text>
          </Card>
        ) : (
          <Card withBorder p={0}>
            <ScrollArea>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th
                      style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'var(--mantine-color-body)',
                      }}
                    >
                      Time Slot
                    </Table.Th>
                    {voters.map((name) => (
                      <Table.Th key={name} style={{ minWidth: 120 }}>
                        {name}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedSlots.map((slot) => {
                    const slotId = String(slot?.id ?? '');
                    const r = resultsBySlot.get(slotId);
                    return (
                      <Table.Tr key={slotId}>
                        <Table.Td
                          fw={600}
                          style={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: 'var(--mantine-color-body)',
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="sm" c="dimmed">
                              {formatDate(slot.date)}
                            </Text>
                            <Text>
                              {slot.startTime} – {slot.endTime}
                            </Text>
                          </Stack>
                        </Table.Td>
                        {voters.map((name) => {
                          const v = r?.byName.get(name);
                          return (
                            <Table.Td key={name}>
                              {v ? (
                                <VoteBadge value={v} />
                              ) : (
                                <Text c="dimmed">—</Text>
                              )}
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </div>
    </Stack>
  );
}
