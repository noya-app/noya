import { CanvasKitInit, Paint, PaintStyle } from 'canvaskit';
import { CanvasKit } from 'canvaskit-types';
import { getPathToWasm } from 'noya-utils';

declare module 'canvaskit' {
  interface Paint {
    style?: PaintStyle;
  }
}

// Using `var` avoids this being uninitialized, maybe due to circular dependencies
var loadingPromise: ReturnType<() => Promise<CanvasKit>> | undefined =
  undefined;

export function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const CanvasKit = await CanvasKitInit({
      locateFile: (file: string) => getPathToWasm() + file,
    });

    const _setStyle = CanvasKit.Paint.prototype.setStyle;

    CanvasKit.Paint.prototype.setStyle = function (
      this: Paint,
      paintStyle: PaintStyle,
    ) {
      this.style = paintStyle;
      _setStyle.call(this, paintStyle);
    };

    resolve(CanvasKit as unknown as CanvasKit);
  });

  return loadingPromise;
}
