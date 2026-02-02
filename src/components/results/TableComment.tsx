import { Popover, Indicator, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Poll } from '~/pages/organize/poll';

type Props = {
  name: string;
  poll: Poll;
};

export const TableComment = ({ name, poll }: Props) => {
  const [opened, { close, open }] = useDisclosure(false);
  return (
    <Popover
      opened={opened}
      disabled={poll.comment?.find((c) => c.name === name) === undefined}
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
            disabled={poll.comment?.find((c) => c.name === name) === undefined}
          >
            {name}
          </Indicator>
        </div>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        {poll.comment?.find((c) => c.name === name) ? (
          <Text size="sm">
            {poll.comment?.find((c) => c.name === name)?.comment}
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
