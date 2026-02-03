import { Popover, Indicator, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Poll } from '~/server/routers/schemas';

type Props = {
  name: string;
  userId: string;
  poll: Poll;
};

export const TableComment = ({ userId, name, poll }: Props) => {
  const [opened, { close, open }] = useDisclosure(false);
  return (
    <Popover
      opened={opened}
      disabled={poll.comment?.find((c) => c.userId === userId) === undefined}
      position="top-start"
      withArrow
    >
      <Popover.Target>
        <div
          onMouseEnter={open}
          onMouseLeave={close}
          className="cursor-default"
        >
          <Indicator
            inline
            position="middle-end"
            offset={-10}
            color="yellow"
            disabled={
              poll.comment?.find((c) => c.userId === userId) === undefined
            }
          >
            {name}
          </Indicator>
        </div>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        {poll.comment?.find((c) => c.userId === userId) ? (
          <Text size="sm">
            {poll.comment?.find((c) => c.userId === userId)?.comment}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            No comment
          </Text>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};
