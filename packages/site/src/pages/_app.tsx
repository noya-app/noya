import { getCurrentPlatform } from '@noya-app/noya-keymap';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  darkTheme,
} from 'noya-designsystem';
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

  if (noyaClient) {
    return (
      <NoyaAPIProvider value={noyaClient}>
        <Analytics>
          <DesignSystemConfigurationProvider
            theme={darkTheme}
            platform={platform}
          >
            <Component {...pageProps} />
          </DesignSystemConfigurationProvider>
        </Analytics>
      </NoyaAPIProvider>
    );
  } else if (isDocsPage) {
    return (
      <OptionalNoyaAPIProvider>
        <Analytics>
          <DesignSystemConfigurationProvider
            theme={darkTheme}
            platform={platform}
          >
            <Docs urlPrefix={docsUrlPrefix}>
              <Component {...pageProps} />
            </Docs>
          </DesignSystemConfigurationProvider>
        </Analytics>
      </OptionalNoyaAPIProvider>
    );
  } else {
    return (
      <OptionalNoyaAPIProvider>
        <Analytics>
          <Component {...pageProps} />
        </Analytics>
      </OptionalNoyaAPIProvider>
    );
  }
}
