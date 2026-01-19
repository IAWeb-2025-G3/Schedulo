import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import DocumentRoot from '~/components/layout/DocumentRoot';
import { defaultTheme } from '~/components/layout/theme';

export default function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(process.env.NODE_ENV);
  return (
    <div
      className={`${
        process.env.NODE_ENV == 'development' ? 'debug-screens' : ''
      }`}
    >
      <MantineProvider defaultColorScheme="auto" theme={defaultTheme}>
        <Notifications />
        <ModalsProvider>
          <DocumentRoot>{children}</DocumentRoot>
        </ModalsProvider>
      </MantineProvider>
    </div>
  );
}
