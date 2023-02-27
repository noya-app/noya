import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  Stack,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import { amplitude } from 'noya-log';
import React, { useMemo } from 'react';
import { Analytics, installAnalytics } from '../components/Analytics';
import { OptionalNoyaAPIProvider } from '../components/OptionalNoyaAPIProvider';
import { Docs } from '../docs/Docs';
import '../styles/index.css';
import {
  localStorageClient,
  networkClientThatRedirects,
} from '../utils/noyaClient';

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

installAnalytics();
amplitude.logEvent('App - Opened');

const docsUrlPrefix = '/docs';
const shareUrlPrefix = '/share';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isDocsPage = router.asPath.startsWith(docsUrlPrefix);
  const isSharePage = router.asPath.startsWith(shareUrlPrefix);
  const isSessionRequired = !(isSharePage || isDocsPage);

  const noyaClient = useMemo(() => {
    return isSessionRequired
      ? new NoyaAPI.Client({
          networkClient: networkClientThatRedirects ?? localStorageClient,
        })
      : undefined;
  }, [isSessionRequired]);

  // console.log(Component, pageProps, router);

  if (noyaClient) {
    return (
      <DesignSystemConfigurationProvider theme={darkTheme} platform={platform}>
        <NoyaAPIProvider value={noyaClient}>
          <Analytics>
            <Component {...pageProps} />
          </Analytics>
        </NoyaAPIProvider>
      </DesignSystemConfigurationProvider>
    );
  } else if (isDocsPage) {
    return (
      <DesignSystemConfigurationProvider theme={darkTheme} platform={platform}>
        <OptionalNoyaAPIProvider>
          <Stack.V
            id="docs-container"
            flex="1"
            background={darkTheme.colors.canvas.background}
          >
            <Docs urlPrefix={docsUrlPrefix}>
              <Component {...pageProps} />
            </Docs>
          </Stack.V>
        </OptionalNoyaAPIProvider>
      </DesignSystemConfigurationProvider>
    );
  } else {
    return <Component {...pageProps} />;
  }
}
