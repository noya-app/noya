import Sketch from 'noya-file-format';
import type { CanvasKit, Image } from 'canvaskit';
import { Theme } from 'noya-designsystem';
import { Components, render, unmount } from 'noya-react-canvaskit';
import { WorkspaceState } from 'noya-state';
import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import {
  CanvasKitProvider,
  ComponentsProvider,
  FontManagerProvider,
} from 'noya-renderer';
import { StateProvider } from 'noya-app-state-context';
import { ImageCacheProvider } from 'noya-renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { SVGRenderer } from 'noya-svg-renderer';
import { UTF16 } from 'noya-utils';

function readPixels(image: Image): Uint8Array | null {
  const colorSpace = image.getColorSpace();

  const pixels = image.readPixels(0, 0, {
    ...image.getImageInfo(),
    colorSpace,
  }) as Uint8Array | null;

  colorSpace.delete();

  return pixels;
}

export type ImageEncoding = 'bytes' | 'svg' | 'png' | 'jpg' | 'webp';

export function generateImage(
  CanvasKit: CanvasKit,
  width: number,
  height: number,
  theme: Theme,
  state: WorkspaceState,
  format: ImageEncoding,
  renderContent: () => ReactNode,
): Promise<Uint8Array | undefined> {
  switch (format) {
    case Sketch.ExportFileFormat.SVG: {
      const svg = renderToStaticMarkup(
        <CanvasKitProvider CanvasKit={CanvasKit}>
          <ThemeProvider theme={theme}>
            <StateProvider state={state}>
              <ImageCacheProvider>
                <FontManagerProvider>
                  <SVGRenderer
                    idPrefix=""
                    size={{ width: width, height: height }}
                  >
                    {renderContent()}
                  </SVGRenderer>
                </FontManagerProvider>
              </ImageCacheProvider>
            </StateProvider>
          </ThemeProvider>
        </CanvasKitProvider>,
      );

      return Promise.resolve(
        UTF16.toUTF8(`<?xml version="1.0" encoding="UTF-8"?>\n` + svg),
      );
    }
    default: {
      const surface = CanvasKit.MakeSurface(width, height);

      if (!surface) {
        console.warn('failed to create surface');
        return Promise.resolve(undefined);
      }

      return new Promise((resolve) => {
        const root = (
          <CanvasKitProvider CanvasKit={CanvasKit}>
            <ThemeProvider theme={theme}>
              <StateProvider state={state}>
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
        );

        render(root, surface, CanvasKit, () => {
          const image = surface.makeImageSnapshot();

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

          unmount(surface, () => {
            resolve(bytes);

            surface.delete();
          });
        });
      });
    }
  }
}
