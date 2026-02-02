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
  Loader,
  Alert,
  ScrollArea,
  Divider,
  ActionIcon,
  Button,
  ThemeIcon,
  Menu,
  Group,
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
  IconEdit,
  IconDotsVertical,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrophyOff,
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
import { TableComment } from '~/components/results/TableComment';
import { modals } from '@mantine/modals';
import { VoteBadge } from '~/components/results/VoteBadge';
import { SortingButton } from '~/components/results/SortingButton';
import { TimeSlot, VoteValue } from '~/server/routers/schemas';

dayjs.extend(utc);

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

type SortColumn = 'date' | 'yes' | 'ifNeedBe' | 'no';

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

  const startPollMutation = trpc.poll.startPoll.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const pausePollMutation = trpc.poll.pausePoll.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const deletePollMutation = trpc.poll.deletePoll.useMutation({
    onSuccess: () => {
      router.push('/organize');
    },
  });

  const winnerMutation = trpc.poll.setWinner.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const deleteWinnerMutation = trpc.poll.deleteWinner.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const deleteVotesMutation = trpc.poll.deleteVotes.useMutation({
    onSuccess: () => {
      utils.poll.fetchPoll.invalidate({ id: id ?? '' });
    },
  });

  const startPoll = async () => {
    await startPollMutation.mutateAsync({
      id: id ?? '',
    });
  };

  const pausePoll = async () => {
    await pausePollMutation.mutateAsync({
      id: id ?? '',
    });
  };

  const closePoll = async () => {
    await closePollMutation.mutateAsync({
      id: id ?? '',
    });
  };

  const reopenPoll = async () => {
    await reopenPollMutation.mutateAsync({
      id: id ?? '',
    });
  };

  const setWinner = async (slot: TimeSlot) => {
    await winnerMutation.mutateAsync({ id: id ?? '', winner: slot });
  };

  const deleteWinner = async () => {
    await deleteWinnerMutation.mutateAsync({ id: id ?? '' });
  };

  const deleteVotes = (userId: string) => {
    modals.openConfirmModal({
      title: 'Delete Votes',
      children: (
        <Text size="sm">
          Are you sure you want to delete all votes from this participant? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteVotesMutation.mutateAsync({ pollId: id ?? '', userId });
      },
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
      ifNeedBe: number;
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
      ifNeedBe: 0,
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
    const value: VoteValue = String(v?.value ?? '') as VoteValue;

    const slotRes = ensureSlot(slotId);

    const prev = slotRes.byName.get(name);
    if (prev) {
      if (prev.value === 'yes') slotRes.yes -= 1;
      else if (prev.value === 'ifNeedBe') slotRes.ifNeedBe -= 1;
      else if (prev.value === 'no') slotRes.no -= 1;
    } else {
      slotRes.total += 1;
    }

    slotRes.byName.set(name, { value, comment: v?.comment });

    if (value === 'yes') slotRes.yes += 1;
    else if (value === 'ifNeedBe') slotRes.ifNeedBe += 1;
    else if (value === 'no') slotRes.no += 1;
  }

  const voters: { name: string; userId: string }[] = Array.from(
    votes.reduce((set: Map<string, string>, v: any) => {
      const name = String(v?.name ?? 'Anonymous');
      const userId = String(v?.userId ?? name);
      set.set(name, userId);
      return set;
    }, new Map<string, string>()),
  )
    .map(([name, userId]) => ({ name, userId }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
      ifNeedBe: 0,
      no: 0,
      total: 0,
      byName: new Map(),
    };
    const bRes = resultsBySlot.get(bId) ?? {
      yes: 0,
      ifNeedBe: 0,
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
    } else if (sortColumn === 'ifNeedBe') {
      comparison = aRes.ifNeedBe - bRes.ifNeedBe;
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

  // Calculate winner - slot with most "yes" votes, then most "ifNeedBe", then least "no"
  const calcWinner = sortedSlots.reduce<{
    slot: any;
    score: number;
    stats: any;
    isManuallySelected?: boolean;
  } | null>((best, slot) => {
    const slotId = String(slot?.id ?? '');
    const r = resultsBySlot.get(slotId) ?? {
      yes: 0,
      ifNeedBe: 0,
      no: 0,
      total: 0,
      byName: new Map(),
    };

    // Do not select a winner if there are no votes yet
    if (r.total === 0) {
      return best;
    }

    // Score: prioritize yes votes, then ifNeedBe, penalize no votes
    // Weight: yes = 3, ifNeedBe = 1, no = -2
    const score = r.yes * 3 + r.ifNeedBe * 1 - r.no * 2;

    if (!best || score > best.score) {
      return { slot, score, stats: r };
    }
    return best;
  }, null);

  const storedWinner = () => {
    if (poll.winner) {
      const slotId = String(poll.winner?.id ?? '');
      const r = resultsBySlot.get(slotId) ?? {
        yes: 0,
        ifNeedBe: 0,
        no: 0,
        total: 0,
        byName: new Map(),
      };
      return { slot: poll.winner, stats: r, isManuallySelected: true };
    }
    return null;
  };
  const winner = poll.winner ? storedWinner() : calcWinner;

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
                title={
                  poll.closedAt ? 'Closed' : poll.active ? 'Active' : 'Paused'
                }
                radius="lg"
                className={cn(
                  poll.closedAt ? '' : poll.active ? 'animate-pulse' : '',
                )}
                color={
                  poll.closedAt ? undefined : poll.active ? 'green' : 'yellow'
                }
              >
                {poll.closedAt ? (
                  <IconLock size={20} />
                ) : poll.active ? (
                  <IconActivity size={20} />
                ) : (
                  <IconPlayerPauseFilled size={20} />
                )}
              </ThemeIcon>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <>
              {poll.closedAt === undefined && (
                <ActionIcon
                  variant="filled"
                  size="lg"
                  onClick={poll.active ? pausePoll : startPoll}
                  title={poll.active ? 'Pause Poll' : 'Start Poll'}
                  loading={
                    poll.active
                      ? pausePollMutation.isPending
                      : startPollMutation.isPending
                  }
                >
                  {poll.active ? (
                    <IconPlayerPauseFilled size={20} />
                  ) : (
                    <IconPlayerPlayFilled size={20} />
                  )}
                </ActionIcon>
              )}

              <ActionIcon
                disabled={!poll.active}
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
                poll={poll}
              />
            )}
            {!poll.closedAt && (
              <ShareButton
                poll={poll}
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

          <div className="flex gap-4 mt-2">
            <Badge size="lg" variant="light" className="">
              {voters.length} {voters.length === 1 ? 'Voter' : 'Voters'}
            </Badge>
            <Badge size="lg" variant="light" className="">
              {sortedSlots.length} Time{' '}
              {sortedSlots.length === 1 ? 'Slot' : 'Slots'}
            </Badge>
          </div>
        </Stack>
      </Card>

      {/* Winner Card */}
      {winner && (
        <Card withBorder padding="xl">
          <Stack gap="md">
            <div className="flex gap-2 items-center">
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
                  Based on final voting decision
                </Text>
              </div>
            </div>

            <Divider />

            <Stack gap="xs">
              <div className="flex gap-4 items-start">
                <div style={{ flex: 1 }}>
                  <Text size="sm" c="dimmed" mb={4}>
                    Date & Time
                  </Text>
                  <Group gap="sm">
                    <Text fw={700} size="xl">
                      {formatDate(winner.slot.date, dateFormat)}
                    </Text>
                    <Text c="dimmed" fw={600} size="xl">
                      {winner.slot.startTime} – {winner.slot.endTime}
                    </Text>
                  </Group>
                </div>

                <div style={{ flex: 1 }}>
                  <Text size="sm" c="dimmed" mb={8}>
                    Voting Breakdown -{' '}
                    <Text size="sm" c="dimmed" mt={8} span>
                      {winner.stats.total}{' '}
                      {winner.stats.total === 1 ? 'vote' : 'votes'}
                    </Text>
                  </Text>
                  <div className="flex gap-2 flex-wrap">
                    {winner.stats.yes > 0 && (
                      <Badge
                        size="lg"
                        color="green"
                        variant="filled"
                        leftSection={<IconCheck size={16} />}
                        className=""
                      >
                        {winner.stats.yes} Yes
                      </Badge>
                    )}
                    {winner.stats.ifNeedBe > 0 && (
                      <Badge
                        size="lg"
                        color="yellow"
                        variant="filled"
                        leftSection={<IconQuestionMark size={16} />}
                        className=""
                      >
                        {winner.stats.ifNeedBe} If Need Be
                      </Badge>
                    )}
                    {winner.stats.no > 0 && (
                      <Badge
                        size="lg"
                        color="red"
                        variant="filled"
                        leftSection={<IconX size={16} />}
                        className=""
                      >
                        {winner.stats.no} No
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Stack>
          </Stack>
        </Card>
      )}

      {!winner && (
        <Card withBorder padding="lg">
          <div className="flex gap-2 items-center">
            <IconAlertCircle size={20} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">
              No votes yet. The winner will be displayed once participants start
              voting or the organizer selects a time slot manually.
            </Text>
          </div>
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
                    <Table.Th> </Table.Th>
                    <Table.Th onClick={() => handleSort('date')}>
                      <div className="flex gap-2 items-center">
                        <span style={{ fontWeight: 700 }}>Time Slot</span>
                        {sortColumn === 'date' && (
                          <SortingButton sortDirection={sortDirection} />
                        )}
                      </div>
                    </Table.Th>
                    <Table.Th onClick={() => handleSort('yes')}>
                      <div className="flex gap-2 items-center">
                        <span style={{ fontWeight: 700 }}>Yes</span>
                        {sortColumn === 'yes' && (
                          <SortingButton sortDirection={sortDirection} />
                        )}
                      </div>
                    </Table.Th>
                    <Table.Th onClick={() => handleSort('ifNeedBe')}>
                      <div className="flex gap-2 items-center">
                        <span style={{ fontWeight: 700 }}>If Need Be</span>
                        {sortColumn === 'ifNeedBe' && (
                          <SortingButton sortDirection={sortDirection} />
                        )}
                      </div>
                    </Table.Th>
                    <Table.Th onClick={() => handleSort('no')}>
                      <div className="flex gap-2 items-center">
                        <span style={{ fontWeight: 700 }}>No</span>
                        {sortColumn === 'no' && (
                          <SortingButton sortDirection={sortDirection} />
                        )}
                      </div>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedSlotsForSummary.map((slot) => {
                    const slotId = String(slot?.id ?? '');
                    const r = resultsBySlot.get(slotId) ?? {
                      yes: 0,
                      ifNeedBe: 0,
                      no: 0,
                      total: 0,
                      byName: new Map(),
                    };

                    return (
                      <Table.Tr key={slotId}>
                        <Table.Td style={{ whiteSpace: 'nowrap', width: 1 }}>
                          <div className="flex gap-1">
                            <Button
                              fullWidth
                              styles={{
                                root: {
                                  backgroundColor:
                                    winner?.slot.id === slot.id
                                      ? 'var(--mantine-color-yellow-6)'
                                      : undefined,
                                  color:
                                    winner?.slot.id === slot.id
                                      ? 'var(--mantine-color-dark-9)'
                                      : undefined,
                                  '&:hover': {
                                    backgroundColor:
                                      winner?.slot.id === slot.id
                                        ? 'var(--mantine-color-yellow-7)'
                                        : undefined,
                                  },
                                },
                              }}
                              onClick={() => setWinner(slot)}
                              leftSection={
                                winner?.slot.id === slot.id ? (
                                  <IconTrophy size={18} />
                                ) : (
                                  <IconTrophyOff size={18} />
                                )
                              }
                              size="sm"
                              disabled={
                                winner?.slot.id === slot.id ||
                                poll.closedAt !== undefined
                              }
                              variant={
                                winner?.slot.id === slot.id ? 'filled' : 'light'
                              }
                            >
                              {winner?.slot.id === slot.id
                                ? 'Winner'
                                : 'Select as Winner'}
                            </Button>
                            {storedWinner()?.slot.id === slot.id && (
                              <ActionIcon
                                size="input-sm"
                                color="red"
                                variant="outline"
                                onClick={deleteWinner}
                                disabled={poll.closedAt !== undefined}
                                title="Remove Manual Selection"
                              >
                                <IconX size={20} />
                              </ActionIcon>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td fw={600}>
                          <Stack gap={2}>
                            <Text>
                              <Text fw={700} span>
                                {formatDate(slot.date, dateFormat)}
                              </Text>{' '}
                              <Text c="dimmed" span>
                                {slot.startTime} – {slot.endTime}
                              </Text>
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td align="center">
                          <Badge
                            color="green"
                            variant="light"
                            size="lg"
                            className=""
                          >
                            {r.yes}
                          </Badge>
                        </Table.Td>
                        <Table.Td align="center">
                          <Badge
                            color="yellow"
                            variant="light"
                            size="lg"
                            className=""
                          >
                            {r.ifNeedBe}
                          </Badge>
                        </Table.Td>
                        <Table.Td align="center">
                          <Badge
                            color="red"
                            variant="light"
                            size="lg"
                            className=""
                          >
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
                        minWidth: 140,
                      }}
                    >
                      Time Slot
                    </Table.Th>
                    {voters.map(({ name, userId }) => {
                      return (
                        <Table.Th key={userId} style={{ minWidth: 120 }}>
                          <div className="flex gap-2 justify-between items-center">
                            <TableComment
                              userId={userId}
                              name={name}
                              poll={poll}
                            />
                            <ActionIcon
                              onClick={() => deleteVotes(userId)}
                              variant="light"
                              color="red"
                              title="Remove User Votes"
                            >
                              <IconTrash size={20} />
                            </ActionIcon>
                          </div>
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
                          }}
                        >
                          <Stack gap={2}>
                            <Text>
                              <Text fw={700} span>
                                {formatDate(slot.date, dateFormat)}
                              </Text>{' '}
                              <Text c="dimmed" span>
                                {slot.startTime} – {slot.endTime}
                              </Text>
                            </Text>
                          </Stack>
                        </Table.Td>
                        {voters.map(({ name, userId }) => {
                          const v = r?.byName.get(name);
                          return (
                            <Table.Td key={userId}>
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
