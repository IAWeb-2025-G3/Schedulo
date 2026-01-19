import { ActionIcon, Button } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';

type ShareButtonProps = {
  title?: string;
  text?: string;
  url?: string;
};

export const ShareButton = ({
  title = document.title,
  text,
  url = window.location.href,
}: ShareButtonProps) => {
  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // User cancelled → ignore
    }
  };

  if (!canShare) return null; // or fallback UI

  return (
    <>
      <ActionIcon
        className="sm:!hidden"
        size="lg"
        onClick={handleShare}
        title="Go back"
      >
        <IconShare size={16} />
      </ActionIcon>
      <Button
        leftSection={<IconShare size={16} />}
        onClick={handleShare}
        className="!hidden sm:!block"
      >
        Share
      </Button>
    </>
  );
};
