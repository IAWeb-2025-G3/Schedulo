import * as React from 'react';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import {
  Card,
  Title,
  Text,
  Badge,
  Stack,
  Group,
  Loader,
  Alert,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconQuestionMark,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';
import { NextPageWithLayout } from '~/pages/_app';
import { usePreferences } from '~/components/layout/PreferenceProvider';
import { formatDate } from '~/pages/organize/[id]/results';

type VoteValue = 'yes' | 'no' | 'ifNeedBe';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const { dateFormat } = usePreferences();

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

  if (poll.closedAt === undefined) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Poll Still Open"
        color="yellow"
      >
        The poll is still open. Results will be available once the poll is
        closed.
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

  return (
    <Stack gap="lg" className="w-full max-w-6xl py-8">
      <div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <Title order={1}>Poll Results</Title>
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
          </Group>
        </Stack>
      </Card>

      {/* Winner Card */}
      {winner && (winner.stats.total > 0 || winner.isManuallySelected) && (
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
                  Chosen Time Slot
                </Title>
                <Text c="dimmed" size="sm">
                  Based on final voting decision
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
                  <Group gap="xs" wrap="wrap">
                    {winner.stats.yes > 0 && (
                      <Badge
                        size="lg"
                        color="green"
                        variant="filled"
                        leftSection={<IconCheck size={16} />}
                        style={{ textTransform: 'none' }}
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
                        style={{ textTransform: 'none' }}
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
                        style={{ textTransform: 'none' }}
                      >
                        {winner.stats.no} No
                      </Badge>
                    )}
                  </Group>
                </div>
              </Group>
            </Stack>
          </Stack>
        </Card>
      )}

      {(!winner ||
        (winner.stats.total === 0 && !winner.isManuallySelected)) && (
        <Card withBorder padding="lg">
          <Group gap="sm">
            <IconAlertCircle size={20} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">No votes submitted.</Text>
          </Group>
        </Card>
      )}
    </Stack>
  );
};

export default Page;
