import {
  Card,
  Tooltip,
  ActionIcon,
  Text,
  TooltipProps,
  Menu,
  Space,
  Indicator,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCheck,
  IconX,
  IconQuestionMark,
  IconDotsVertical,
  IconMessageFilled,
  IconTrash,
} from '@tabler/icons-react';
import { CommentModal } from '~/components/VoteForm/CommentModal';
import { Poll, TimeSlot, VoteValue } from '~/pages/organize/poll';

type Props = {
  slot: TimeSlot;
  form: UseFormReturnType<Poll, (values: Poll) => Poll>;
  data: Poll;
};

const tooltipProps: TooltipProps = {
  label: '',
  openDelay: 500,
};
export const TimeSlotCard = ({ slot, form, data }: Props) => {
  const handleConfirmation = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({ pollId: data.id!, name: '', timeSlotId: id, value: 'yes' });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'yes',
        };
      }
      return next;
    });
  };
  const handleRejection = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({ pollId: data.id!, name: '', timeSlotId: id, value: 'no' });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'no',
        };
      }
      return next;
    });
  };

  const handleUndecided = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex === -1) {
        next.push({
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'ifNeedBe',
        });
      } else {
        next[voteIndex] = {
          pollId: data.id!,
          name: '',
          timeSlotId: id,
          value: 'ifNeedBe',
        };
      }
      return next;
    });
  };

  const deleteComment = (id: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex !== -1) {
        next[voteIndex].comment = undefined;
      }
      return next;
    });
  };

  const addComment = (id: string, comment: string) => {
    form.setFieldValue('votes', (current) => {
      const next = [...current!];
      const voteIndex = next.findIndex((vote) => vote.timeSlotId === id);
      if (voteIndex !== -1) {
        next[voteIndex].comment = comment;
      }
      return next;
    });
  };

  const handleComment = (id: string) => {
    modals.open({
      title: 'Add Comment',
      children: (
        <CommentModal addComment={(comment) => addComment(id, comment)} />
      ),
    });
  };

  const handleButtonStyle = (slotId: string, value: VoteValue) => {
    return form.values.votes?.find((vote) => vote.timeSlotId === slotId)
      ?.value === value
      ? 'filled'
      : 'subtle';
  };

  const hasComment =
    form.values.votes?.find((vote) => vote.timeSlotId === slot.id)?.comment !==
      undefined &&
    form.values.votes?.find((vote) => vote.timeSlotId === slot.id)?.comment !==
      '';

  return (
    <div className="flex gap-2 items-center">
      <Card withBorder className="!py-1">
        <Text>{slot.startTime}</Text>
      </Card>
      -
      <Card withBorder className="!py-1">
        <Text>{slot.endTime}</Text>
      </Card>
      <Card withBorder className="flex !flex-row gap-1 items-center !p-0">
        <Tooltip {...tooltipProps} label="Yes" color="green">
          <ActionIcon
            size="input-xs"
            variant={handleButtonStyle(slot.id, 'yes')}
            color="green"
            onClick={() => handleConfirmation(slot.id)}
          >
            <IconCheck size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip {...tooltipProps} label="No" color="red">
          <ActionIcon
            size="input-xs"
            variant={handleButtonStyle(slot.id, 'no')}
            color="red"
            onClick={() => handleRejection(slot.id)}
          >
            <IconX size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip {...tooltipProps} label="If Need Be" color="yellow">
          <ActionIcon
            size="input-xs"
            variant={handleButtonStyle(slot.id, 'ifNeedBe')}
            color="yellow"
            onClick={() => handleUndecided(slot.id)}
          >
            <IconQuestionMark size={16} />
          </ActionIcon>
        </Tooltip>
      </Card>
      <Space></Space>
      <Menu withArrow position="bottom-end" shadow="md" withinPortal>
        <Menu.Target>
          <Indicator color="yellow" disabled={!hasComment}>
            <ActionIcon variant="light">
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconMessageFilled size={16} />}
            onClick={() => handleComment(slot.id)}
          >
            Add Comment
          </Menu.Item>
          {hasComment && (
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => {
                deleteComment(slot.id);
              }}
            >
              Delete Comment
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
