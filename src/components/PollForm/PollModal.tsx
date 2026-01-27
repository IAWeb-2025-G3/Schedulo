import { Button, CopyButton, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconPencilPlus } from '@tabler/icons-react';

export const cn = (...classNames: (string | boolean | undefined)[]) =>
  classNames.filter(Boolean).join(' ');
type Props = {
  pollId: string;
  clearForm: () => void;
};

export const PollModal = ({ pollId, clearForm }: Props) => {
  const copyToClipboard = () => {
    notifications.show({
      title: 'Link Copied',
      message: 'Poll link copied to clipboard!',
      color: 'green',
    });
  };

  const resetForm = () => {
    modals.close('poll-created');
    clearForm();
  };

  return (
    <div className="flex flex-col gap-2">
      <Text>
        You{' '}
        <Text span fw="bold">
          successfully
        </Text>{' '}
        created a new poll.
      </Text>
      <div className="flex gap-2">
        <CopyButton
          value={`${window.location.origin}/vote/${pollId}`}
          timeout={2000}
        >
          {({ copied, copy }) => (
            <Button
              color={!copied ? undefined : 'white'}
              onClick={() => {
                copy();
                copyToClipboard();
              }}
              leftSection={
                copied ? (
                  <IconCheck size="1.25rem" />
                ) : (
                  <IconCopy size="1.25rem" />
                )
              }
              variant={!copied ? 'filled' : 'default'}
              className={cn(copied && 'animate-glow')}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          )}
        </CopyButton>
        <Button
          onClick={resetForm}
          variant="outline"
          leftSection={<IconPencilPlus size={18} />}
        >
          Create New Poll
        </Button>
      </div>
    </div>
  );
};
