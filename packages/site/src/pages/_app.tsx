import type { AppProps } from 'next/app';
import { NoyaAPIProvider } from 'noya-api';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import React from 'react';
import '../styles/index.css';
import { noyaClient } from '../utils/noyaClient';

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoyaAPIProvider value={noyaClient}>
      <DesignSystemConfigurationProvider theme={darkTheme} platform={platform}>
        <Component {...pageProps} />
      </DesignSystemConfigurationProvider>
    </NoyaAPIProvider>
  );
}
