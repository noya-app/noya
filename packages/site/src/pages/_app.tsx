import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { NoyaAPIProvider } from 'noya-api';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import { amplitude } from 'noya-log';
import React, { useMemo } from 'react';
import { Analytics, installAnalytics } from '../components/Analytics';
import '../styles/index.css';
import { createNoyaClient } from '../utils/noyaClient';

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

installAnalytics();
amplitude.logEvent('App - Opened');

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isSessionRequired = !router.asPath.startsWith('/share');

  const noyaClient = useMemo(() => {
    return isSessionRequired ? createNoyaClient() : undefined;
  }, [isSessionRequired]);

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
  } else {
    return <Component {...pageProps} />;
  }
}
