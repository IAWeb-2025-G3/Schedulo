import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';

import { DefaultLayout } from '~/components/layout/DefaultLayout';
import { trpc } from '~/utils/trpc';
import '~/styles/globals.css';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/nprogress/styles.css';
import ProvidersWrapper from '~/components/layout/ProvidersWrapper';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = (({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <ProvidersWrapper>
      {getLayout(<Component {...pageProps} />)}
    </ProvidersWrapper>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
