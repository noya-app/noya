import type { Surface } from 'canvaskit';
import { Insets, Size } from 'noya-geometry';
import { Components, render, unmount } from 'noya-react-canvaskit';
import {
  ComponentsProvider,
  ImageCacheProvider,
  SketchFileRenderer,
} from 'noya-renderer';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import {
  StateProvider,
  useWorkspaceState,
} from '../../contexts/ApplicationStateContext';
import useCanvasKit from '../../hooks/useCanvasKit';
import { useWorkspace } from '../../hooks/useWorkspace';

declare module 'canvaskit' {
  interface Surface {
    flush(): void;
    _id: number;
  }
}

const CanvasComponent = styled.canvas<{ left: number }>(({ theme, left }) => ({
  position: 'absolute',
  top: 0,
  left,
  zIndex: -1,
}));

interface Props {
  size: Size;
  insets: Insets;
}

export default memo(function CanvasKitRenderer({ size, insets }: Props) {
  const theme = useTheme();
  const workspaceState = useWorkspaceState();
  const [surface, setSurface] = useState<Surface | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const { setCanvasSize } = useWorkspace();

  // Update the canvas size whenever the window is resized
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    canvasElement.width = size.width + insets.left + insets.right;
    canvasElement.height = size.height;
  }, [size, insets, setCanvasSize]);

  const surfaceWidth = surface?.width();
  const surfaceHeight = surface?.height();

  // Recreate the surface whenever the canvas resizes
  //
  // TODO: This should also be a layout effect so that it happens before the canvas is rendered.
  // However, there seems to be a problem with the ordering of things when it's a layout effect.
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (
      !canvasElement ||
      (surfaceWidth === size.width && surfaceHeight === size.height)
    )
      return;

    const newSurface = CanvasKit.MakeCanvasSurface(canvasElement);

    if (!newSurface) {
      console.warn('failed to create surface');
    }

    setSurface(newSurface);

    return () => {
      newSurface?.delete();
    };
  }, [CanvasKit, size, surfaceHeight, surfaceWidth]);

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
              <ComponentsProvider value={Components}>
                <SketchFileRenderer />
              </ComponentsProvider>
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

  return (
    <CanvasComponent ref={canvasRef} left={-insets.left} width={0} height={0} />
  );
});
