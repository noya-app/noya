import type { FontMgr, Paint, PaintStyle } from 'canvaskit';
import { CanvasKitInit } from 'canvaskit';
import { v4 as uuid } from 'uuid';
import { Context } from './context';
import * as Primitives from './primitives';
export { default as LayerPreview } from './components/LayerPreview';
export { default as SketchArtboard } from './components/layers/SketchArtboard';
export { default as SketchGroup } from './components/layers/SketchGroup';
export { default as SketchLayer } from './components/layers/SketchLayer';
export { default as SketchFileRenderer } from './components/SketchFileRenderer';
export * from './ComponentsContext';
export { ImageCacheProvider } from './ImageCache';
export type { Context };
export { uuid, Primitives };

export type SimpleTextDecoration = Primitives.SimpleTextDecoration;

export let fontManager: FontMgr;

declare module 'canvaskit' {
  interface Paint {
    style?: PaintStyle;
  }
}

export async function load() {
  const [CanvasKit, fontBuffer] = await Promise.all([
    CanvasKitInit({
      locateFile: (file: string) => '/wasm/' + file,
    }),
    fetch(
      'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
    ).then((resp) => resp.arrayBuffer()),
  ]);

  fontManager = CanvasKit.FontMgr.FromData(fontBuffer)!;

  const _setStyle = CanvasKit.Paint.prototype.setStyle;

  CanvasKit.Paint.prototype.setStyle = function (
    this: Paint,
    paintStyle: PaintStyle,
  ) {
    this.style = paintStyle;
    _setStyle.call(this, paintStyle);
  };

  return CanvasKit;
}
