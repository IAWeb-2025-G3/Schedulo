import { AppShell, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { IconCalendarEvent } from '@tabler/icons-react';
import Link from 'next/link';
import { UserMenu } from '~/components/layout/UserMenu';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header>
        <div className="flex justify-between items-center h-full gap-2 p-4">
          <div></div>
          <Link href="/">
            <div className="flex items-center gap-2">
              <ThemeIcon variant="transparent">
                <IconCalendarEvent />
              </ThemeIcon>
              <Title>Schedulo</Title>
            </div>
          </Link>
          <UserMenu />
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <div className="flex w-full justify-center">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};
