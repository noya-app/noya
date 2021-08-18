import { CanvasKitInit, Paint, PaintStyle } from 'canvaskit';
import { getPathToWasm } from 'noya-utils';
import { Context } from './context';
export { default as LayerPreview } from './components/LayerPreview';
export { default as SketchArtboard } from './components/layers/SketchArtboard';
export { default as SketchGroup } from './components/layers/SketchGroup';
export { default as SketchLayer } from './components/layers/SketchLayer';
export { default as SketchFileRenderer } from './components/SketchFileRenderer';
export * from './ComponentsContext';
export * from './FontManagerContext';
export * from './RootScaleContext';
export * from './RenderingModeContext';
export * from './hooks/useCanvasKit';
export { ImageCacheProvider, useSketchImage } from './ImageCache';
export type { Context };
export { useTextLayerParagraph } from './components/layers/SketchText';

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

    resolve(CanvasKit);
  });

  return loadingPromise;
}
