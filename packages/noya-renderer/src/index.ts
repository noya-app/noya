import type { FontMgr } from 'canvaskit';
import { v4 as uuid } from 'uuid';
import { CanvasKitInit } from 'canvaskit';
import { Context } from './context';
import * as Primitives from './primitives';
export { default as SketchFileRenderer } from './components/SketchFileRenderer';
export { default as SketchLayer } from './components/layers/SketchLayer';
export { default as SketchArtboard } from './components/layers/SketchArtboard';
export { default as SketchGroup } from './components/layers/SketchGroup';

export type { Context };
export { uuid, Primitives };
export type SimpleTextDecoration = Primitives.SimpleTextDecoration;

export let fontManager: FontMgr;

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

  return CanvasKit;
}
