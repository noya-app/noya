import { CanvasKitInit, Paint, PaintStyle } from 'canvaskit';
import { PATH_TO_WASM } from 'noya-utils';
import { v4 as uuid } from 'uuid';
import { Context } from './context';
import * as Primitives from './primitives';
export { default as LayerPreview } from './components/LayerPreview';
export { default as SketchArtboard } from './components/layers/SketchArtboard';
export { default as SketchGroup } from './components/layers/SketchGroup';
export { default as SketchLayer } from './components/layers/SketchLayer';
export { default as SketchFileRenderer } from './components/SketchFileRenderer';
export * from './ComponentsContext';
export * from './FontManagerContext';
export * from './hooks/useCanvasKit';
export { ImageCacheProvider } from './ImageCache';
export type { Context };
export { uuid, Primitives };

export type SimpleTextDecoration = Primitives.SimpleTextDecoration;

declare module 'canvaskit' {
  interface Paint {
    style?: PaintStyle;
  }
}

// Using `var` avoids this being uninitialized, maybe due to circular dependencies
var loadingPromise: ReturnType<typeof CanvasKitInit> | undefined = undefined;

export function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const CanvasKit = await CanvasKitInit({
      locateFile: (file: string) => PATH_TO_WASM + file,
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
