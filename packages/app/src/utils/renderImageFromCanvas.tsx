import type Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit, Image } from 'canvaskit';
import { Theme } from 'noya-designsystem';
import { render, unmount } from 'noya-react-canvaskit';
import { WorkspaceState } from 'noya-state';
import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { StateProvider } from '../contexts/ApplicationStateContext';
import { ImageCacheProvider } from 'noya-renderer';

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
  format: 'bytes' | Sketch.ExportFileFormat,
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
        <ImageCacheProvider>
          <StateProvider state={state}>{renderContent()}</StateProvider>
        </ImageCacheProvider>
      </ThemeProvider>
    );

    render(root, surface, CanvasKit, () => {
      const image = surface.makeImageSnapshot();

      const colorSpace = image.getColorSpace();

      const bytes =
        format === 'bytes'
          ? readPixels(image)
          : image.encodeToBytes(
              format === 'png'
                ? CanvasKit.ImageFormat.PNG
                : format === 'jpg'
                ? CanvasKit.ImageFormat.JPEG
                : CanvasKit.ImageFormat.WEBP,
              100,
            );

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
