import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import DocumentRoot from '~/components/layout/DocumentRoot';
import { PreferencesProvider } from '~/components/layout/PreferenceProvider';
import { defaultTheme } from '~/components/layout/theme';
import { env } from '~/server/env';

export default function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${env.NODE_ENV == 'development' ? 'debug-screens' : ''}`}>
      <MantineProvider defaultColorScheme="auto" theme={defaultTheme}>
        <PreferencesProvider>
          <Notifications />
          <ModalsProvider>
            <DocumentRoot>{children}</DocumentRoot>
          </ModalsProvider>
        </PreferencesProvider>
      </MantineProvider>
    </div>
  );
}
