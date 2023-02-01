import type { CanvasKitInit, Paint, PaintStyle } from 'canvaskit';
import { getPublicPath } from 'noya-public-path';

declare module 'canvaskit' {
  // Exposed for svgkit, where we need to be able to introspect the paint
  interface Paint {
    style?: PaintStyle;
    _alpha?: number;
    _shader?: Shader;
  }
}

// Using `var` avoids this being uninitialized, maybe due to circular dependencies
// eslint-disable-next-line no-var
var loadingPromise: ReturnType<typeof CanvasKitInit> | undefined = undefined;

export function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const module = await import('canvaskit');

    const CanvasKit = await module.CanvasKitInit({
      locateFile: (file: string) => getPublicPath() + 'wasm/' + file,
    });

    const _setStyle = CanvasKit.Paint.prototype.setStyle;

    CanvasKit.Paint.prototype.setStyle = function (
      this: Paint,
      paintStyle: PaintStyle,
    ) {
      this.style = paintStyle;
      _setStyle.call(this, paintStyle);
    };

    resolve(CanvasKit);
  });

  return loadingPromise;
}
