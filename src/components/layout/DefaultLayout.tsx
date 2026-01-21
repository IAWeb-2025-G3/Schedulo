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
        <div className="relative flex items-center justify-center h-full p-4">
          <Link href="/">
            <div className="flex items-center gap-2">
              <ThemeIcon variant="transparent">
                <IconCalendarEvent />
              </ThemeIcon>
              <Title>Schedulo</Title>
            </div>
          </Link>
          <div className="absolute right-4">
            <UserMenu />
          </div>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <div className="flex w-full justify-center">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};
