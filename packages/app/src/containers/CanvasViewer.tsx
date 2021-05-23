import type { CanvasKit } from 'canvaskit-wasm';
import { Theme } from 'noya-designsystem';
import { render, unmount } from 'noya-react-canvaskit';
import { WorkspaceState } from 'noya-state';
import React, {
  memo,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ThemeProvider, useTheme } from 'styled-components';
import {
  StateProvider,
  useWorkspaceState,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';

function renderImageFromCanvas(
  CanvasKit: CanvasKit,
  width: number,
  height: number,
  theme: Theme,
  state: WorkspaceState,
  renderContent: () => ReactNode,
): Promise<Uint8Array | undefined> {
  const surface = CanvasKit.MakeSurface(width, height);

  if (!surface) {
    console.warn('failed to create surface');
    return Promise.resolve(undefined);
  }

  const context = {
    CanvasKit,
    canvas: surface.getCanvas(),
  };

  return new Promise((resolve) => {
    const root = (
      <ThemeProvider theme={theme}>
        <StateProvider state={state} dispatch={() => {}}>
          {renderContent()}
        </StateProvider>
      </ThemeProvider>
    );

    render(root, surface, context, () => {
      const image = surface.makeImageSnapshot();

      const colorSpace = image.getColorSpace();

      const bytes = image.readPixels(0, 0, {
        ...image.getImageInfo(),
        colorSpace: image.getColorSpace(),
      }) as Uint8Array;

      colorSpace.delete();

      unmount(surface, context, () => {
        resolve(bytes);

        surface.delete();
      });
    });
  });
}

interface Props {
  width: number;
  height: number;
  renderContent: () => ReactNode;
}

export default memo(function CanvasViewer({
  width,
  height,
  renderContent,
}: Props) {
  const CanvasKit = useCanvasKit();
  const rawApplicationState = useWorkspaceState();
  const theme = useTheme();
  const [imageData, setImageData] = useState<ImageData | undefined>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    let valid = true;

    renderImageFromCanvas(
      CanvasKit,
      width,
      height,
      theme,
      rawApplicationState,
      renderContent,
    ).then((bytes) => {
      if (!valid || !bytes) return;

      setImageData(
        new ImageData(new Uint8ClampedArray(bytes.buffer), width, height),
      );
    });

    return () => {
      valid = false;
    };
  }, [CanvasKit, width, height, theme, rawApplicationState, renderContent]);

  useLayoutEffect(() => {
    if (!imageData) return;

    const context = canvasRef.current?.getContext('2d');

    if (!context) return;

    context.putImageData(imageData, 0, 0);
  }, [height, imageData, width]);

  return <canvas ref={canvasRef} width={width} height={height} />;
});
