import { ActionIcon, Divider, Menu, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconCalendar,
  IconCheck,
  IconMoon,
  IconSettings,
  IconSun,
  IconSunMoon,
} from '@tabler/icons-react';
import {
  DateFormat,
  usePreferences,
} from '~/components/layout/PreferenceProvider';

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

  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();

  return (
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
  );
}
