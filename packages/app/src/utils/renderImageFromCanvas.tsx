import type { CanvasKit, Image } from 'canvaskit';
import { Theme } from 'noya-designsystem';
import { render, unmount } from 'noya-react-canvaskit';
import { WorkspaceState } from 'noya-state';
import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { StateProvider } from '../contexts/ApplicationStateContext';

function readPixels(image: Image): Uint8Array | null {
  return image.readPixels(0, 0, {
    ...image.getImageInfo(),
    colorSpace: image.getColorSpace(),
  }) as Uint8Array | null;
}

export function renderImageFromCanvas(
  CanvasKit: CanvasKit,
  width: number,
  height: number,
  theme: Theme,
  state: WorkspaceState,
  format: 'bytes' | 'png',
  renderContent: () => ReactNode,
): Promise<Uint8Array | undefined> {
  const surface = CanvasKit.MakeSurface(width, height);

  if (!surface) {
    console.warn('failed to create surface');
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    const root = (
      <ThemeProvider theme={theme}>
        <StateProvider state={state}>{renderContent()}</StateProvider>
      </ThemeProvider>
    );

    render(root, surface, CanvasKit, () => {
      const image = surface.makeImageSnapshot();

      const colorSpace = image.getColorSpace();

      const bytes =
        format === 'bytes'
          ? readPixels(image)
          : image.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);

      if (!bytes) {
        resolve(undefined);
        return;
      }

      colorSpace.delete();

      unmount(surface, () => {
        resolve(bytes);

        surface.delete();
      });
    });
  });
}
