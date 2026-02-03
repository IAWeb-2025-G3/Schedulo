import { Button, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

type Props = {
  addComment: (comment: string) => void;
  comment?: string;
};

export const CommentModal = ({ addComment, comment }: Props) => {
  const [value, setValue] = useState(comment || '');
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        label="Comment"
        value={value}
        placeholder="Add any additional comment here"
        onChange={(event) => setValue(event.currentTarget.value)}
        resize="vertical"
      />
      <Button
        leftSection={<IconCheck size={16} />}
        onClick={() => {
          addComment(value);
          modals.closeAll();
        }}
      >
        Submit
      </Button>
    </div>
  );
};
