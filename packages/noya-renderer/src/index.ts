import type { CanvasKitInit, FontMgr } from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
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

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export async function load() {
  const [CanvasKit, fontBuffer] = await Promise.all([
    init({
      locateFile: (file: string) =>
        'https://unpkg.com/canvaskit-wasm@0.25.0/bin/' + file,
    }),
    fetch(
      'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
    ).then((resp) => resp.arrayBuffer()),
  ]);

  fontManager = CanvasKit.FontMgr.FromData(fontBuffer)!;

  return CanvasKit;
}
