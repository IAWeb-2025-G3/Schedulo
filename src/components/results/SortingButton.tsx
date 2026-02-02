import { ThemeIcon } from '@mantine/core';
import {
  IconSortAscendingNumbers,
  IconSortDescendingNumbers,
} from '@tabler/icons-react';

export const SortingButton = ({
  sortDirection,
}: {
  sortDirection: 'asc' | 'desc';
}) => {
  return (
    <ThemeIcon variant="light" size="md">
      {sortDirection === 'asc' ? (
        <IconSortAscendingNumbers size={20} title="Sorted Ascending" />
      ) : (
        <IconSortDescendingNumbers size={20} title="Sorted Descending" />
      )}
    </ThemeIcon>
  );
};
