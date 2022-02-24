import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from 'styled-components';
import { Canvas as SkiaCanvas } from '@shopify/react-native-skia';

import { useWorkspaceState, StateProvider } from 'noya-app-state-context';
import { Components } from 'noya-react-canvaskit';
import {
  SketchFileRenderer,
  useCanvasKit,
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
  FontManagerProvider,
  RenderingModeProvider,
} from 'noya-renderer';

const CanvasRenderer = () => {
  const workspaceState = useWorkspaceState();
  const CanvasKit = useCanvasKit();
  const theme = useTheme();

  return (
    <SkiaCanvas style={styles.canvas}>
      <CanvasKitProvider CanvasKit={CanvasKit}>
        <ThemeProvider theme={theme}>
          <ImageCacheProvider>
            <FontManagerProvider>
              <StateProvider state={workspaceState}>
                <ComponentsProvider value={Components}>
                  <RenderingModeProvider value="interactive">
                    <SketchFileRenderer />
                  </RenderingModeProvider>
                </ComponentsProvider>
              </StateProvider>
            </FontManagerProvider>
          </ImageCacheProvider>
        </ThemeProvider>
      </CanvasKitProvider>
    </SkiaCanvas>
  );
};

export default memo(CanvasRenderer);

const styles = StyleSheet.create({ canvas: { flex: 1 } });
