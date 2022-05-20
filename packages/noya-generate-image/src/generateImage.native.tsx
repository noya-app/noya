import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { renderToStaticMarkup } from 'react-dom/server';

import { SkiaView } from '@shopify/react-native-skia/src/views/SkiaView';
import { skiaReconciler } from '@shopify/react-native-skia/src/renderer/Canvas';
import { Container } from '@shopify/react-native-skia/src/renderer/nodes/Container';
import { DrawingContext } from '@shopify/react-native-skia/src/renderer/DrawingContext';
import { DependencyManager } from '@shopify/react-native-skia/src/renderer/DependencyManager';

import type { CanvasKit as PublicCanvasKit } from 'canvaskit-types';
import { CanvasKitNative } from 'noya-native-canvaskit';
import { StateProvider } from 'noya-app-state-context';
import { Components } from 'noya-react-canvaskit';
import { SVGRenderer } from 'noya-svg-renderer';
import { WorkspaceState } from 'noya-state';
import { Theme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { UTF16 } from 'noya-utils';
import {
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
  FontManagerProvider,
} from 'noya-renderer';
import type { ImageEncoding } from './types';

// SkiaView placeholder for skia reconciler
// which keeps track of shared values, which won't
// be used for single render purpouse
const canvasRef = {
  current: {
    registerValues: () => () => {},
  } as unknown as SkiaView,
};

const render = (element: ReactNode, root: any, callback: () => void) => {
  skiaReconciler.updateContainer(element, root, null, callback);
};

export function generateImage(
  CanvasKit: typeof CanvasKitNative,
  width: number,
  height: number,
  theme: Theme,
  state: WorkspaceState,
  format: ImageEncoding,
  renderContent: () => ReactNode,
): Promise<Uint8Array | undefined> {
  return new Promise((resolve) => {
    if (format === Sketch.ExportFileFormat.SVG) {
      const svg = renderToStaticMarkup(
        <CanvasKitProvider CanvasKit={CanvasKit as unknown as PublicCanvasKit}>
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

      resolve(UTF16.toUTF8(`<?xml version="1.0" encoding="UTF-8"?>\n` + svg));
      return;
    }

    const dependencyManager = new DependencyManager(canvasRef);
    const container = new Container(dependencyManager, () => null);
    const root = skiaReconciler.createContainer(container, 0, false, null);

    async function onRenderFinished() {
      const surface = CanvasKit.MakeSurface(width, height);

      if (!surface) {
        console.warn('failed to create surface');
        resolve(undefined);
        return;
      }

      const drawingContext = {
        width,
        height,
        timestamp: Date.now(),
        canvas: surface.getCanvas(),
        paint: new CanvasKit.Paint(),
        opacity: 1,
        ref: canvasRef,
        center: {
          x: width / 2,
          y: height / 2,
        },
        fontMgr: CanvasKit.FontMgr.RefDefault(),
      };

      container.draw(drawingContext as unknown as DrawingContext);

      const image = surface.makeImageSnapshot();

      // TODO: add readPixels method for 'bytes' format
      // when rn-skia image will have readPixels implemented
      const bytes = image.encodeToBytes(
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

      resolve(bytes);
    }

    render(
      <CanvasKitProvider CanvasKit={CanvasKit as unknown as PublicCanvasKit}>
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
      </CanvasKitProvider>,
      root,
      onRenderFinished,
    );
  });
}
