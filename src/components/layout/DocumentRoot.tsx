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
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <main>{children}</main>
    </>
  );
}
