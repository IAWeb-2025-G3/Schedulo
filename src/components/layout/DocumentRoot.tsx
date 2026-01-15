import { useMantineColorScheme } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import Head from 'next/head';

export default function DocumentRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggleColorScheme } = useMantineColorScheme();
  useHotkeys([['ctrl+L', () => toggleColorScheme()]]);
  return (
    <>
      <Head>
        <title>Schedulo</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <meta name="description" content="" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Apollo" />
        {/* <link rel="manifest" href="/site.webmanifest" /> */}
      </Head>

      <main>{children}</main>
    </>
  );
}
