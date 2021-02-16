import {
  getCurrentPage,
  getCurrentPageMetadata,
} from 'ayano-state/src/selectors';
import type { CanvasKitInit, FontMgr } from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
import { renderHoverOutline } from './canvas/hover';
import { renderSelectionOutline } from './canvas/selection';
import { Context } from './context';
import { renderLayer } from './layers/layer';
import * as Primitives from './primitives';

export type { Context };
export { uuid, Primitives };

let fontManager: FontMgr;

export function renderCanvas(context: Context) {
  const { CanvasKit, canvas, state, theme } = context;

  const page = getCurrentPage(state);
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  canvas.clear(CanvasKit.parseColorString(theme.backgroundColor));

  canvas.save();
  canvas.translate(scrollOrigin.x + state.canvasInsets.left, scrollOrigin.y);
  canvas.scale(zoomValue, zoomValue);

  page.layers.forEach((layer) => {
    renderLayer(context, fontManager, layer);
  });

  const selectionPaint = new CanvasKit.Paint();
  selectionPaint.setColor(CanvasKit.Color(180, 180, 180, 0.5));
  selectionPaint.setStrokeWidth(1);
  selectionPaint.setStyle(CanvasKit.PaintStyle.Stroke);
  selectionPaint.setAntiAlias(true);

  page.layers.forEach((layer) => {
    renderSelectionOutline(
      context,
      layer,
      selectionPaint,
      state.selectedObjects,
    );
  });

  const highlightPaint = new CanvasKit.Paint();
  highlightPaint.setColor(CanvasKit.Color(132, 63, 255, 1));
  highlightPaint.setStrokeWidth(2);
  highlightPaint.setStyle(CanvasKit.PaintStyle.Stroke);
  highlightPaint.setAntiAlias(true);

  const highlightedLayer = state.highlightedLayer;

  // Don't draw a highlight when hovering over a selected layer on the canvas
  if (
    highlightedLayer &&
    (highlightedLayer.precedence === 'aboveSelection' ||
      !state.selectedObjects.includes(highlightedLayer.id))
  ) {
    page.layers.forEach((layer) => {
      renderHoverOutline(context, layer, highlightPaint, [highlightedLayer.id]);
    });
  }

  if (state.interactionState.type === 'drawing') {
    renderLayer(context, fontManager, state.interactionState.value);
  }

  canvas.restore();
}

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export async function load() {
  const [CanvasKit, fontBuffer] = await Promise.all([
    init({
      locateFile: (file: string) =>
        'https://unpkg.com/canvaskit-wasm@^0.22.0/bin/' + file,
    }),
    fetch(
      'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
    ).then((resp) => resp.arrayBuffer()),
  ]);

  fontManager = CanvasKit.FontMgr.FromData(fontBuffer)!;

  return CanvasKit;
}
