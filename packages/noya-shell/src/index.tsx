import { StateProvider } from 'noya-app-state-context';
import { NoyaColorsEditor } from 'noya-colors-editor';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { MultiplayerProvider } from 'noya-multiplayer';
import { setPublicPath } from 'noya-public-path';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import * as React from 'react';
import { Suspense, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle({
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
  },
});

let initialized = false;

export default function NoyaColorsEditorStandalone(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  const workspaceState = useMemo(
    () => createInitialWorkspaceState(createSketchFile()),
    [],
  );

  return (
    <Suspense fallback="Loading">
      <MultiplayerProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <StateProvider state={workspaceState}>
              <DesignSystemConfigurationProvider
                theme={darkTheme}
                platform={'key'}
              >
                <GlobalStyles />
                <NoyaColorsEditor />
              </DesignSystemConfigurationProvider>
            </StateProvider>
          </FontManagerProvider>
        </CanvasKitProvider>
      </MultiplayerProvider>
    </Suspense>
  );
}
