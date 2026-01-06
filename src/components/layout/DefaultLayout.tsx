import { AppShell, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { IconCalendarEvent } from '@tabler/icons-react';
import Link from 'next/link';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header>
        <Link href="/">
          <div className="flex justify-center items-center h-full gap-2">
            <ThemeIcon variant="transparent">
              <IconCalendarEvent />
            </ThemeIcon>
            <Title>Schedulo</Title>
          </div>
        </Link>
      </AppShell.Header>

      <AppShell.Main>
        <div className="flex w-full justify-center">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};
