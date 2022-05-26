import React, { memo, ReactNode } from 'react';
import styled, { useTheme, ThemeProvider } from 'styled-components';
import { Canvas } from '@shopify/react-native-skia';

import { useWorkspaceState } from 'noya-app-state-context';
import { StateProvider } from 'noya-app-state-context';
import { Components } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
  FontManagerProvider,
} from 'noya-renderer';

interface Props {
  width: number;
  height: number;
  renderContent: () => ReactNode;
}

const Container = styled(Canvas)<{ width: number; height: number }>(
  ({ width, height }) => ({
    width,
    height,
  }),
);

function CanvasViewer({ width, height, renderContent }: Props) {
  const rawApplicationState = useWorkspaceState();
  const CanvasKit = useCanvasKit();
  const theme = useTheme();

  return (
    <Container width={width} height={height}>
      <CanvasKitProvider CanvasKit={CanvasKit}>
        <ThemeProvider theme={theme}>
          <StateProvider state={rawApplicationState}>
            <ImageCacheProvider>
              <FontManagerProvider>
                <ComponentsProvider value={Components}>
                  {renderContent()}
                </ComponentsProvider>
              </FontManagerProvider>
            </ImageCacheProvider>
          </StateProvider>
        </ThemeProvider>
      </CanvasKitProvider>
    </Container>
  );
}

export default memo(CanvasViewer);
