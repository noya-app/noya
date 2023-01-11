import type { AppProps } from 'next/app';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import React from 'react';
import '../styles/index.css';

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={platform}>
      <Component {...pageProps} />
    </DesignSystemConfigurationProvider>
  );
}