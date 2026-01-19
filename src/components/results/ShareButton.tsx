import { Button } from '@mantine/core';
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
    <Button leftSection={<IconShare size={16} />} onClick={handleShare}>
      Share
    </Button>
  );
};
