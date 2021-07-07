import type { Surface } from 'canvaskit';
import { Size } from 'noya-geometry';
import { Components, render, unmount } from 'noya-react-canvaskit';
import {
  ComponentsProvider,
  FontManagerProvider,
  ImageCacheProvider,
  SketchFileRenderer,
  useCanvasKit,
} from 'noya-renderer';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import {
  StateProvider,
  useWorkspaceState,
} from '../../contexts/ApplicationStateContext';

const CanvasComponent = styled.canvas({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
});

interface Props {
  size: Size;
}

export default memo(function CanvasKitRenderer({ size }: Props) {
  const theme = useTheme();
  const workspaceState = useWorkspaceState();
  const [surface, setSurface] = useState<Surface | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();

  // Update the canvas size and recreate the surface whenever the window is resized
  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    canvasElement.width = size.width;
    canvasElement.height = size.height;

    const newSurface = CanvasKit.MakeCanvasSurface(canvasElement);

    if (!newSurface) {
      console.warn('failed to create surface');
      return;
    }

    setSurface(newSurface);

    return () => {
      newSurface?.delete();
    };
  }, [CanvasKit, size]);

  // We use `useLayoutEffect` so that the canvas updates as soon as possible,
  // even at the expense of the UI stuttering slightly.
  // With `useEffect`, the updates are batched and potentially delayed, which
  // makes continuous events like modifying a color unusably slow.
  useLayoutEffect(() => {
    if (!surface || surface.isDeleted()) return;

    try {
      render(
        <ThemeProvider theme={theme}>
          <StateProvider state={workspaceState}>
            <ImageCacheProvider>
              <FontManagerProvider>
                <ComponentsProvider value={Components}>
                  <SketchFileRenderer />
                </ComponentsProvider>
              </FontManagerProvider>
            </ImageCacheProvider>
          </StateProvider>
        </ThemeProvider>,
        surface,
        CanvasKit,
      );

      return () => {
        unmount(surface);
      };
    } catch (e) {
      console.warn('rendering error', e);
    }
  }, [CanvasKit, workspaceState, theme, surface]);

  return <CanvasComponent ref={canvasRef} />;
});
