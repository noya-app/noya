import {
  getCurrentPage,
  getCurrentPageMetadata,
} from 'noya-state/src/selectors';
import type { CanvasKitInit, FontMgr } from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
import { renderHoverOutline } from './canvas/hover';
import {
  getBoundingRect,
  getDragHandles,
  renderSelectionOutline,
} from './canvas/selection';
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

  const boundingRect = getBoundingRect(page, state.selectedObjects);

  if (boundingRect) {
    canvas.drawRect(
      Primitives.rect(CanvasKit, Primitives.insetRect(boundingRect, 0.5, 0.5)),
      selectionPaint,
    );
  }

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

  if (boundingRect) {
    const dragHandlePaint = new CanvasKit.Paint();
    dragHandlePaint.setColor(CanvasKit.Color(255, 255, 255, 1));
    dragHandlePaint.setStyle(CanvasKit.PaintStyle.Fill);
    dragHandlePaint.setAntiAlias(true);

    const dragHandles = getDragHandles(boundingRect);

    dragHandles.forEach((handle) => {
      canvas.drawRect(Primitives.rect(CanvasKit, handle.rect), dragHandlePaint);
      canvas.drawRect(
        Primitives.rect(CanvasKit, Primitives.insetRect(handle.rect, 0.5, 0.5)),
        selectionPaint,
      );
    });
  }

  switch (state.interactionState.type) {
    case 'drawing':
      renderLayer(context, fontManager, state.interactionState.value);
      break;
    case 'marquee':
      const marqueeStrokePaint = new CanvasKit.Paint();
      marqueeStrokePaint.setColor(CanvasKit.Color(220, 220, 220, 0.9));
      marqueeStrokePaint.setStrokeWidth(2);
      marqueeStrokePaint.setStyle(CanvasKit.PaintStyle.Stroke);
      marqueeStrokePaint.setAntiAlias(true);

      const marqueeFillPaint = new CanvasKit.Paint();
      marqueeFillPaint.setColor(CanvasKit.Color(255, 255, 255, 0.2));
      marqueeFillPaint.setStyle(CanvasKit.PaintStyle.Fill);
      marqueeFillPaint.setAntiAlias(true);

      const { origin, current } = state.interactionState;

      const rect = Primitives.rect(
        CanvasKit,
        Primitives.createRect(origin, current),
      );
      canvas.drawRect(rect, marqueeFillPaint);
      canvas.drawRect(rect, marqueeStrokePaint);
      break;
  }

  canvas.restore();
}

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export async function load() {
  const [CanvasKit, fontBuffer] = await Promise.all([
    init({
      locateFile: (file: string) =>
        'https://unpkg.com/canvaskit-wasm@^0.23.0/bin/' + file,
    }),
    fetch(
      'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
    ).then((resp) => resp.arrayBuffer()),
  ]);

  fontManager = CanvasKit.FontMgr.FromData(fontBuffer)!;

  return CanvasKit;
}
