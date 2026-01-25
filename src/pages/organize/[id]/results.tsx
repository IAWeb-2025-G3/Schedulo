import * as React from 'react';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  Stack,
  Group,
  Loader,
  Alert,
  ScrollArea,
  Divider,
  ActionIcon,
  Button,
  ThemeIcon,
  Indicator,
  Popover,
  Menu,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconQuestionMark,
  IconAlertCircle,
  IconTrophy,
  IconArrowLeft,
  IconLock,
  IconRecycle,
  IconActivity,
  IconTrash,
  IconSortDescendingNumbers,
  IconSortAscendingNumbers,
  IconEdit,
  IconDotsVertical,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextPageWithLayout } from '~/pages/_app';
import {
  DateFormat,
  usePreferences,
} from '~/components/layout/PreferenceProvider';
import { ShareButton } from '~/components/results/ShareButton';
import { cn } from '~/components/PollForm/PollModal';
import { useDisclosure } from '@mantine/hooks';
import { TableComment } from '~/components/results/TableComment';
import { modals } from '@mantine/modals';

dayjs.extend(utc);

type VoteValue = 'yes' | 'no' | 'ifneedbe';

export function formatDate(value: Date | string | number, fmt: DateFormat) {
  // For string dates in YYYY-MM-DD format, parse as UTC to avoid timezone offset issues
  const d = typeof value === 'string' ? dayjs.utc(value) : dayjs(value);
  if (!d.isValid()) return '—';

  switch (fmt) {
    case 'unix':
      return String(d.unix());
    case 'de':
      return d.format('DD.MM.YYYY');
    case 'uk':
      return d.format('DD/MM/YYYY');
    case 'us':
      return d.format('MM/DD/YYYY');
    default:
      return d.toISOString().split('T')[0];
  }
}

function VoteBadge({ value, comment }: { value: VoteValue; comment?: string }) {
  const [opened, { close, open }] = useDisclosure(false);

  let content = <></>;
  const normalized = String(value).toLowerCase();
  if (normalized === 'yes') {
    content = (
      <Badge color="green" leftSection={<IconCheck size={14} />}>
        Yes
      </Badge>
    );
  } else if (normalized === 'no') {
    content = (
      <Badge color="red" leftSection={<IconX size={14} />}>
        No
      </Badge>
    );
  } else if (normalized === 'ifneedbe') {
    content = (
      <Badge
        color="yellow"
        variant="light"
        leftSection={<IconQuestionMark size={14} />}
      >
        If Need Be
      </Badge>
    );
  } else {
    content = <Text c="dimmed">—</Text>;
  }
  return (
    <Popover opened={opened} disabled={!comment} position="top-start" withArrow>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Indicator position="top-start" color="yellow" disabled={!comment}>
            {content}
          </Indicator>
        </div>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        {comment ? (
          <Text size="sm">{comment}</Text>
        ) : (
          <Text size="sm" c="dimmed">
            No comment
          </Text>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

type SortColumn = 'date' | 'yes' | 'ifneedbe' | 'no';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const { dateFormat } = usePreferences();
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('yes');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'desc',
  );

  const {
    data: poll,
    isLoading,
    error,
  } = trpc.poll.fetchPoll.useQuery(
    { id: id ?? '' },
    { enabled: !!id, refetchInterval: 10000 },
  );

  const utils = trpc.useUtils();
  const closePollMutation = trpc.poll.closePoll.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const reopenPollMutation = trpc.poll.reopenPoll.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const deletePollMutation = trpc.poll.deletePoll.useMutation({
    onSuccess: () => {
      router.push('/organize');
    },
  });

  const closePoll = () => {
    closePollMutation.mutateAsync({
      id: id ?? '',
    });
  };

  const reopenPoll = () => {
    reopenPollMutation.mutateAsync({
      id: id ?? '',
    });
  };

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

  const dates = Array.isArray(poll.dates) ? poll.dates : [];
  const votes = Array.isArray(poll.votes) ? poll.votes : [];

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
      byName: Map<string, { value: VoteValue; comment?: string }>;
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
      byName: new Map<string, { value: VoteValue; comment?: string }>(),
    };
    resultsBySlot.set(slotId, fresh);
    return fresh;
  };

  for (const v of votes) {
    const slotId = String(v?.timeSlotId ?? '');
    if (!slotId) continue;

    const name = String(v?.name ?? 'Anonymous');
    const value: VoteValue = String(v?.value ?? '').toLowerCase() as VoteValue;

    const slotRes = ensureSlot(slotId);

    const prev = slotRes.byName.get(name);
    if (prev) {
      if (prev.value === 'yes') slotRes.yes -= 1;
      else if (prev.value === 'ifneedbe') slotRes.ifneedbe -= 1;
      else if (prev.value === 'no') slotRes.no -= 1;
    } else {
      slotRes.total += 1;
    }

    slotRes.byName.set(name, { value, comment: v?.comment });

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

  // Sort slots based on selected column
  const sortedSlotsForSummary = [...sortedSlots].sort((a, b) => {
    const aId = String(a?.id ?? '');
    const bId = String(b?.id ?? '');
    const aRes = resultsBySlot.get(aId) ?? {
      yes: 0,
      ifneedbe: 0,
      no: 0,
      total: 0,
      byName: new Map(),
    };
    const bRes = resultsBySlot.get(bId) ?? {
      yes: 0,
      ifneedbe: 0,
      no: 0,
      total: 0,
      byName: new Map(),
    };

    let comparison = 0;
    if (sortColumn === 'date') {
      // Sort by date first, then by time
      const dateCompare = (a?.date ?? '').localeCompare(b?.date ?? '');
      if (dateCompare !== 0) {
        comparison = dateCompare;
      } else {
        comparison = (a?.startTime ?? '').localeCompare(b?.startTime ?? '');
      }
    } else if (sortColumn === 'yes') {
      comparison = aRes.yes - bRes.yes;
    } else if (sortColumn === 'ifneedbe') {
      comparison = aRes.ifneedbe - bRes.ifneedbe;
    } else if (sortColumn === 'no') {
      comparison = aRes.no - bRes.no;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

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

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Delete Poll',
      children: (
        <Text size="sm">
          Are you sure you want to delete this poll? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deletePollMutation.mutateAsync({ id: id ?? '' });
      },
    });
  };

  return (
    <Stack gap="lg" className="w-full max-w-6xl py-8">
      <div>
        <div className="flex justify-between gap-2">
          <div className="flex gap-4 items-center">
            <ActionIcon
              size="lg"
              variant="light"
              onClick={() => router.push('/organize')}
              title="Go back"
            >
              <IconArrowLeft />
            </ActionIcon>
            <div className="flex gap-2 items-center">
              <Title order={1}>Results</Title>
              <ThemeIcon
                size="md"
                variant={poll.closedAt ? 'transparent' : 'light'}
                title="Closed"
                radius="lg"
                className={cn(poll.closedAt ? '' : 'animate-pulse')}
                color={poll.closedAt ? undefined : 'green'}
              >
                {poll.closedAt ? <IconLock /> : <IconActivity />}
              </ThemeIcon>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <>
              <ActionIcon
                variant="outline"
                className="sm:!hidden"
                size="lg"
                onClick={poll.closedAt === undefined ? closePoll : reopenPoll}
                title={
                  poll.closedAt === undefined ? 'Close Poll' : 'Reopen Poll'
                }
                loading={
                  poll.closedAt === undefined
                    ? closePollMutation.isPending
                    : reopenPollMutation.isPending
                }
              >
                {poll.closedAt === undefined ? (
                  <IconLock size={16} />
                ) : (
                  <IconRecycle size={16} />
                )}
              </ActionIcon>
              <Button
                className="!hidden sm:!block"
                variant="outline"
                onClick={poll.closedAt === undefined ? closePoll : reopenPoll}
                leftSection={
                  poll.closedAt === undefined ? (
                    <IconLock size={16} />
                  ) : (
                    <IconRecycle size={16} />
                  )
                }
                loading={
                  poll.closedAt === undefined
                    ? closePollMutation.isPending
                    : reopenPollMutation.isPending
                }
              >
                {poll.closedAt === undefined ? 'Close Poll' : 'Reopen Poll'}
              </Button>
            </>

            {poll.closedAt && (
              <ShareButton
                title="Poll Results"
                text="Check out the results of this poll!"
                url={`${window.location.origin}/results/${poll.id}`}
              />
            )}
            {!poll.closedAt && (
              <ShareButton
                title="Poll"
                text="Vote in this poll!"
                url={`${window.location.origin}/vote/${poll.id}`}
              />
            )}
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  variant="outline"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => router.push(`/organize/${id}/edit`)}
                >
                  Edit Poll
                </Menu.Item>
                <Menu.Item
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDelete}
                >
                  Delete Poll
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
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
                    {formatDate(winner.slot.date, dateFormat)}
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
                      {winner.stats.ifneedbe} If Need Be
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

      {/* Summary table per votes */}
      <div>
        <Title order={2} mb="md">
          Time Slots Summary
        </Title>
        {sortedSlotsForSummary.length === 0 ? (
          <Card withBorder>
            <Text c="dimmed" ta="center" py="md">
              No time slots added yet.
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
                        cursor: 'pointer',
                        userSelect: 'none',
                        position: 'sticky',
                        left: 0,
                        minWidth: 140,
                        width: '150px',
                      }}
                      onClick={() => handleSort('date')}
                    >
                      <Group gap="xs">
                        <span style={{ fontWeight: 700 }}>Time Slot</span>
                        {sortColumn === 'date' &&
                          (sortDirection === 'asc' ? (
                            <IconSortAscendingNumbers
                              size={16}
                              title="Sorted Ascending"
                            />
                          ) : (
                            <IconSortDescendingNumbers
                              size={16}
                              title="Sorted Descending"
                            />
                          ))}
                      </Group>
                    </Table.Th>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: '150px',
                      }}
                      onClick={() => handleSort('yes')}
                    >
                      <Group gap="xs">
                        <span style={{ fontWeight: 700 }}>Yes</span>
                        {sortColumn === 'yes' &&
                          (sortDirection === 'asc' ? (
                            <IconSortAscendingNumbers
                              size={16}
                              title="Sorted Ascending"
                            />
                          ) : (
                            <IconSortDescendingNumbers
                              size={16}
                              title="Sorted Descending"
                            />
                          ))}
                      </Group>
                    </Table.Th>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: '150px',
                      }}
                      onClick={() => handleSort('ifneedbe')}
                    >
                      <Group gap="xs">
                        <span style={{ fontWeight: 700 }}>If Need Be</span>
                        {sortColumn === 'ifneedbe' &&
                          (sortDirection === 'asc' ? (
                            <IconSortAscendingNumbers
                              size={16}
                              title="Sorted Ascending"
                            />
                          ) : (
                            <IconSortDescendingNumbers
                              size={16}
                              title="Sorted Descending"
                            />
                          ))}
                      </Group>
                    </Table.Th>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: '150px',
                      }}
                      onClick={() => handleSort('no')}
                    >
                      <Group gap="xs">
                        <span style={{ fontWeight: 700 }}>No</span>
                        {sortColumn === 'no' &&
                          (sortDirection === 'asc' ? (
                            <IconSortAscendingNumbers
                              size={16}
                              title="Sorted Ascending"
                            />
                          ) : (
                            <IconSortDescendingNumbers
                              size={16}
                              title="Sorted Descending"
                            />
                          ))}
                      </Group>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedSlotsForSummary.map((slot) => {
                    const slotId = String(slot?.id ?? '');
                    const r = resultsBySlot.get(slotId) ?? {
                      yes: 0,
                      ifneedbe: 0,
                      no: 0,
                      total: 0,
                      byName: new Map(),
                    };

                    return (
                      <Table.Tr key={slotId}>
                        <Table.Td
                          fw={600}
                          style={{
                            position: 'sticky',
                            left: 0,
                          }}
                        >
                          <Stack gap={2}>
                            <Text size="sm" c="dimmed">
                              {formatDate(slot.date, dateFormat)}
                            </Text>
                            <Text>
                              {slot.startTime} – {slot.endTime}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="green" variant="light" size="lg">
                            {r.yes}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="yellow" variant="light" size="lg">
                            {r.ifneedbe}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="red" variant="light" size="lg">
                            {r.no}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Detailed matrix */}
      <div>
        <Title order={2} mb="md">
          Votes Matrix
        </Title>

        {voters.length === 0 ? (
          <Card withBorder>
            <Text c="dimmed" ta="center" py="md">
              No votes yet.
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
                        minWidth: 140,
                      }}
                    >
                      Time Slot
                    </Table.Th>
                    {voters.map((name) => {
                      return (
                        <Table.Th key={name} style={{ minWidth: 120 }}>
                          <TableComment name={name} poll={poll} />
                        </Table.Th>
                      );
                    })}
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
                              {formatDate(slot.date, dateFormat)}
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
                                <VoteBadge
                                  value={v?.value}
                                  comment={v?.comment}
                                />
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
};

export default Page;
