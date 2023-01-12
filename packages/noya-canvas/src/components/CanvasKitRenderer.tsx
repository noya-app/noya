import type { Surface } from 'canvaskit';
import { StateProvider, useWorkspaceState } from 'noya-app-state-context';
import { Size } from 'noya-geometry';
import { Components, render, unmount } from 'noya-react-canvaskit';
import { usePixelRatio } from 'noya-react-utils';
import {
  CanvasKitProvider,
  ComponentsProvider,
  FontManagerProvider,
  ImageCacheProvider,
  RenderingModeProvider,
  RootScaleProvider,
  useCanvasKit,
} from 'noya-renderer';
import React, {
  memo,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';

const CanvasComponent = styled.canvas<{ size: Size }>(({ size }) => ({
  position: 'absolute',
  inset: 0,
  width: `${size.width}px`,
  height: `${size.height}px`,
}));

interface Props {
  size: Size;
  children: ReactNode;
}

export const CanvasKitRenderer = memo(function CanvasKitRenderer({
  size,
  children,
}: Props) {
  const theme = useTheme();
  const workspaceState = useWorkspaceState();
  const [surface, setSurface] = useState<Surface | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const pixelRatio = usePixelRatio();

  // Update the canvas size and recreate the surface whenever the window is resized
  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    canvasElement.width = size.width * pixelRatio;
    canvasElement.height = size.height * pixelRatio;

    const newSurface = CanvasKit.MakeCanvasSurface(canvasElement);

    if (!newSurface) {
      console.warn('failed to create surface');
      return;
    }

    setSurface(newSurface);

    return () => {
      newSurface?.delete();
    };
  }, [CanvasKit, pixelRatio, size]);

  // We use `useLayoutEffect` so that the canvas updates as soon as possible,
  // even at the expense of the UI stuttering slightly.
  // With `useEffect`, the updates are batched and potentially delayed, which
  // makes continuous events like modifying a color unusably slow.
  useLayoutEffect(() => {
    if (!surface || surface.isDeleted()) return;

    try {
      render(
        <CanvasKitProvider>
          <ThemeProvider theme={theme}>
            <StateProvider state={workspaceState}>
              <ImageCacheProvider>
                <FontManagerProvider>
                  <ComponentsProvider value={Components}>
                    <RenderingModeProvider value="interactive">
                      <RootScaleProvider value={pixelRatio}>
                        {children}
                      </RootScaleProvider>
                    </RenderingModeProvider>
                  </ComponentsProvider>
                </FontManagerProvider>
              </ImageCacheProvider>
            </StateProvider>
          </ThemeProvider>
        </CanvasKitProvider>,
        surface,
        CanvasKit,
      );

      return () => {
        if (surface.isDeleted()) {
          unmount(surface);
        }
      };
    } catch (e) {
      console.warn('rendering error', e);
    }
  }, [CanvasKit, workspaceState, theme, surface, pixelRatio, children]);

  return <CanvasComponent size={size} ref={canvasRef} />;
});
