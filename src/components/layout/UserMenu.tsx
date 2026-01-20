import { ActionIcon, Avatar, Divider, Group, Menu, Text, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconCalendar,
  IconCheck,
  IconKey,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconSunMoon,
  IconUser,
} from '@tabler/icons-react';
import {
  DateFormat,
  usePreferences,
} from '~/components/layout/PreferenceProvider';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

export const DATE_FORMAT_KEY = 'date_format';

function formatLabel(fmt: DateFormat) {
  switch (fmt) {
    case 'de':
      return 'German (DD.MM.YYYY)';
    case 'uk':
      return 'UK (DD/MM/YYYY)';
    case 'us':
      return 'American (MM/DD/YYYY)';
    case 'unix':
      return 'Unix (timestamp)';
    case 'ISO 8601':
      return 'ISO 8601 (YYYY-MM-DD)';
  }
}

export function UserMenu() {
  const { dateFormat, setDateFormat } = usePreferences();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();

  const { data: currentUser } = trpc.organizer.getCurrentUser.useQuery();
  const utils = trpc.useUtils();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        // Invalidate the query cache to clear user data
        utils.organizer.getCurrentUser.invalidate();
        utils.organizer.getCurrentOrganizer.invalidate();
        notifications.show({
          title: 'Success',
          message: 'Logged out successfully',
          color: 'green',
        });
        router.push('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to logout',
        color: 'red',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Group gap="xs">
      {currentUser && (
        <Menu shadow="md" width={260} withinPortal position="bottom-end">
          <Menu.Target>
            <Tooltip label={currentUser.isAdmin ? currentUser.username : `Organizer: ${currentUser.username}`} withArrow>
              <ActionIcon variant="subtle" size="lg" aria-label="User menu">
                <IconUser size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Group gap="xs">
                <IconUser size={16} />
                <Text size="sm" fw={500}>
                  {currentUser.isAdmin ? currentUser.username : `Organizer: ${currentUser.username}`}
                </Text>
              </Group>
            </Menu.Label>

            <Divider my="xs" />

            {!currentUser.isAdmin && (
              <Menu.Item
                leftSection={<IconKey size={16} />}
                onClick={() => router.push('/organize/change-password')}
              >
                Change Password
              </Menu.Item>
            )}

            <Menu.Item
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              disabled={loggingOut}
              color="red"
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      <Menu shadow="md" width={260} withinPortal position="bottom-end">
        <Menu.Target>
          <Tooltip label="Settings" withArrow>
            <ActionIcon variant="subtle" size="lg" aria-label="Settings">
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Appearance</Menu.Label>

        <Menu.Item
          leftSection={<IconSunMoon size={16} />}
          rightSection={colorScheme === 'auto' ? <IconCheck size={16} /> : null}
          onClick={() => clearColorScheme()}
        >
          System
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSun size={16} />}
          rightSection={
            colorScheme === 'light' ? <IconCheck size={16} /> : null
          }
          onClick={() => setColorScheme('light')}
        >
          Light
        </Menu.Item>

        <Menu.Item
          leftSection={<IconMoon size={16} />}
          rightSection={colorScheme === 'dark' ? <IconCheck size={16} /> : null}
          onClick={() => setColorScheme('dark')}
        >
          Dark
        </Menu.Item>

        <Divider my="xs" />

        <Menu.Label>Date format</Menu.Label>

        {(['ISO 8601', 'de', 'uk', 'us', 'unix'] as const).map((fmt) => (
          <Menu.Item
            key={fmt}
            leftSection={<IconCalendar size={16} />}
            rightSection={dateFormat === fmt ? <IconCheck size={16} /> : null}
            onClick={() => setDateFormat(fmt)}
          >
            {formatLabel(fmt)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
    </Group>
  );
}
