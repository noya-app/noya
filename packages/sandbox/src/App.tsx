import { StateProvider } from 'noya-app-state-context';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import * as React from 'react';
import { Suspense, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Content } from './Content';

export const GlobalStyles = createGlobalStyle(({ theme }) => ({
  '*': {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },
  html: {
    width: '100%',
    minHeight: '100vh',
  },
  'body, #root': {
    flex: '1',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    background: theme.colors.canvas.background,
  },
}));

let initialized = false;

export default function Embedded(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  const workspaceState = useMemo(
    () => createInitialWorkspaceState(createSketchFile()),
    [],
  );

  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
      <GlobalStyles />
      <Suspense fallback="Loading">
        <CanvasKitProvider>
          <FontManagerProvider>
            <StateProvider state={workspaceState}>
              <Content />
            </StateProvider>
          </FontManagerProvider>
        </CanvasKitProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
