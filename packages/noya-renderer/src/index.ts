import { CanvasKitInit, Paint, PaintStyle } from 'canvaskit';
import { getPublicPath } from 'noya-public-path';
import { Context } from './context';
export * from './colorMatrix';
export { default as LayerPreview } from './components/LayerPreview';
export { default as SketchArtboard } from './components/layers/SketchArtboard';
export { default as SketchGroup } from './components/layers/SketchGroup';
export { default as SketchLayer } from './components/layers/SketchLayer';
export { useTextLayerParagraph } from './components/layers/SketchText';
export { default as SketchFileRenderer } from './components/SketchFileRenderer';
export * from './ComponentsContext';
export * from './FontManagerContext';
export * from './hooks/useCanvasKit';
export * from './hooks/useCompileShader';
export { ImageCacheProvider, useSketchImage } from './ImageCache';
export * from './RenderingModeContext';
export * from './RootScaleContext';
export * from './shaders';
export * from './ZoomContext';
export type { Context };

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
