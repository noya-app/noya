import { StateProvider } from 'noya-app-state-context';
import { ColorSwatch, NoyaColorsEditor } from 'noya-colors-editor';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  Label,
} from 'noya-designsystem';
import { MultiplayerProvider } from 'noya-multiplayer';
import { PipelineProvider, Result, usePipeline } from 'noya-pipeline';
import { setPublicPath } from 'noya-public-path';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import * as React from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Inspector } from 'react-inspector';
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

export function NoyaShell() {
  const pipeline = usePipeline();
  const [colors, setColors] = useState<ColorSwatch[]>([]);

  useEffect(() => {
    pipeline.subscribe('colors', 'colors', (result: Result<ColorSwatch[]>) => {
      if (result.type === 'error') return;
      // console.log('colors -->', result.value);
      setColors(result.value);
    });
  });

  return (
    <>
      <NoyaColorsEditor />
      <div style={{ width: '30%', background: '#222', padding: 10 }}>
        <Label.Label>Colors Pipeline Output</Label.Label>
        <Inspector theme="chromeDark" table={false} data={colors} />
      </div>
    </>
  );
}

export default function NoyaShellStandalone(): JSX.Element {
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
      <PipelineProvider>
        <MultiplayerProvider>
          <CanvasKitProvider>
            <FontManagerProvider>
              <StateProvider state={workspaceState}>
                <DesignSystemConfigurationProvider
                  theme={darkTheme}
                  platform={'key'}
                >
                  <GlobalStyles />
                  <NoyaShell />
                </DesignSystemConfigurationProvider>
              </StateProvider>
            </FontManagerProvider>
          </CanvasKitProvider>
        </MultiplayerProvider>
      </PipelineProvider>
    </Suspense>
  );
}
