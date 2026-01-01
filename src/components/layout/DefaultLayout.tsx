import { AppShell, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { IconCalendarEvent } from '@tabler/icons-react';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header>
        <div className="flex justify-center items-center h-full gap-2">
          <ThemeIcon variant="transparent">
            <IconCalendarEvent />
          </ThemeIcon>
          <Title>Poll</Title>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <div className="flex w-full justify-center">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};
