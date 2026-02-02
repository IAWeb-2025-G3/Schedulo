import { Badge, Popover, Indicator, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX, IconQuestionMark } from '@tabler/icons-react';
import { VoteValue } from '~/server/routers/schemas';

export const VoteBadge = ({
  value,
  comment,
}: {
  value: VoteValue;
  comment?: string;
}) => {
  const [opened, { close, open }] = useDisclosure(false);

  let content = <></>;
  const normalized = String(value);
  if (normalized === 'yes') {
    content = (
      <Badge
        color="green"
        leftSection={<IconCheck size={14} />}
        className="!normal-case"
        size="lg"
        variant="light"
      >
        Yes
      </Badge>
    );
  } else if (normalized === 'no') {
    content = (
      <Badge
        color="red"
        leftSection={<IconX size={14} />}
        className="!normal-case"
        size="lg"
        variant="light"
      >
        No
      </Badge>
    );
  } else if (normalized === 'ifNeedBe') {
    content = (
      <Badge
        color="yellow"
        leftSection={<IconQuestionMark size={14} />}
        className="!normal-case"
        size="lg"
        variant="light"
      >
        If Need Be
      </Badge>
    );
  } else {
    content = <Text c="dimmed">—</Text>;
  }
  return (
    <Popover opened={opened} disabled={!comment} withArrow position="top-start">
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Indicator
            inline
            position="middle-end"
            offset={-10}
            color="yellow"
            disabled={!comment}
          >
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
};
