import React, { memo } from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';
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
} from 'noya-renderer';

const CanvasRenderer = () => {
  const workspaceState = useWorkspaceState();
  const canvasKit = useCanvasKit();
  const theme = useTheme();

  return (
    <StyledCanvas>
      <CanvasKitProvider canvasKit={canvasKit}>
        <ThemeProvider theme={theme}>
          <ImageCacheProvider>
            <FontManagerProvider>
              <StateProvider state={workspaceState}>
                <ComponentsProvider value={Components}>
                  <SketchFileRenderer />
                </ComponentsProvider>
              </StateProvider>
            </FontManagerProvider>
          </ImageCacheProvider>
        </ThemeProvider>
      </CanvasKitProvider>
    </StyledCanvas>
  );
};

export default memo(CanvasRenderer);

const StyledCanvas = styled(SkiaCanvas)((p) => ({
  flex: 1,
}));
