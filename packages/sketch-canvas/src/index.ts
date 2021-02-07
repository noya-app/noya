import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState } from 'ayano-state';
import {
  getCurrentPage,
  getCurrentPageMetadata,
} from 'ayano-state/src/selectors';
import type {
  Canvas,
  CanvasKit,
  CanvasKitInit,
  FontMgr,
  Paint,
  Path,
} from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
import * as Primitives from './primitives';

export { uuid, Primitives };

export interface Context {
  CanvasKit: CanvasKit;
  canvas: Canvas;
}

let fontManager: FontMgr;

export function drawCanvas(
  context: Context,
  state: ApplicationState,
  sidebarWidth: number,
) {
  const { CanvasKit, canvas } = context;

  const page = getCurrentPage(state);
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  canvas.clear(CanvasKit.Color(249, 249, 249));

  canvas.save();
  canvas.translate(scrollOrigin.x + sidebarWidth, scrollOrigin.y);
  canvas.scale(zoomValue, zoomValue);

  page.layers.forEach((layer) => {
    drawLayer(context, layer);
  });

  const selectionPaint = new CanvasKit.Paint();
  selectionPaint.setColor(CanvasKit.Color(180, 180, 180, 0.5));
  selectionPaint.setStrokeWidth(1);
  selectionPaint.setStyle(CanvasKit.PaintStyle.Stroke);
  selectionPaint.setAntiAlias(true);

  page.layers.forEach((layer) => {
    drawSelectionOutline(context, layer, selectionPaint, state.selectedObjects);
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
      drawHoverOutline(context, layer, highlightPaint, [highlightedLayer.id]);
    });
  }

  if (state.interactionState.type === 'drawing') {
    drawLayer(context, state.interactionState.value);
  }

  canvas.restore();
}

export function drawHoverOutline(
  context: Context,
  layer: Sketch.AnyLayer,
  paint: Paint,
  layerIds: string[],
) {
  const { CanvasKit, canvas } = context;

  switch (layer._class) {
    case 'artboard':
    case 'text': {
      if (!layerIds.includes(layer.do_objectID)) break;

      canvas.drawRect(Primitives.rect(CanvasKit, layer.frame), paint);
      break;
    }
    case 'rectangle':
    case 'oval': {
      if (!layerIds.includes(layer.do_objectID)) break;

      const path = Primitives.path(CanvasKit, layer.points, layer.frame);
      path.setFillType(CanvasKit.FillType.EvenOdd);

      canvas.drawPath(path, paint);
      break;
    }
    default:
      console.log(layer._class, 'not handled');
      break;
  }

  switch (layer._class) {
    case 'artboard': {
      canvas.save();
      canvas.translate(layer.frame.x, layer.frame.y);

      layer.layers.forEach((child) => {
        drawHoverOutline(context, child, paint, layerIds);
      });

      canvas.restore();
      break;
    }
    default:
      break;
  }
}

export function drawSelectionOutline(
  context: Context,
  layer: Sketch.AnyLayer,
  paint: Paint,
  layerIds: string[],
) {
  const { CanvasKit, canvas } = context;

  switch (layer._class) {
    case 'artboard':
    case 'rectangle':
    case 'oval':
    case 'text': {
      if (!layerIds.includes(layer.do_objectID)) break;

      const frame = {
        ...layer.frame,
        x: layer.frame.x + 0.5,
        y: layer.frame.y + 0.5,
        width: layer.frame.width - 1,
        height: layer.frame.height - 1,
      };

      canvas.drawRect(Primitives.rect(CanvasKit, frame), paint);

      break;
    }
    default:
      break;
  }

  switch (layer._class) {
    case 'artboard': {
      canvas.save();
      canvas.translate(layer.frame.x, layer.frame.y);

      layer.layers.forEach((child) => {
        drawSelectionOutline(context, child, paint, layerIds);
      });

      canvas.restore();
      break;
    }
    default:
      break;
  }
}

export function drawLayer(context: Context, layer: Sketch.AnyLayer) {
  switch (layer._class) {
    case 'artboard':
      return drawArtboard(context, layer);
    case 'text':
      return drawText(context, layer);
    case 'rectangle':
    case 'oval':
      return drawLayerShape(context, layer);
    default:
      console.log(layer._class, 'not handled');
      return;
  }
}

export function drawArtboard(context: Context, artboard: Sketch.Artboard) {
  const { canvas, CanvasKit } = context;

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.WHITE);
  paint.setStyle(CanvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);

  const blur = new CanvasKit.Paint();
  blur.setColor(CanvasKit.BLACK);
  blur.setAlphaf(0.2);
  blur.setMaskFilter(
    CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, 2, true),
  );

  const rect = Primitives.rect(CanvasKit, artboard.frame);
  const blurRect = Primitives.rect(CanvasKit, {
    ...artboard.frame,
    y: artboard.frame.y + 1,
  });

  canvas.drawRect(blurRect, blur);
  canvas.drawRect(rect, paint);

  canvas.save();
  canvas.clipRect(rect, CanvasKit.ClipOp.Intersect, true);
  canvas.translate(artboard.frame.x, artboard.frame.y);

  artboard.layers.forEach((layer) => {
    drawLayer(context, layer);
  });

  canvas.restore();
}

export function drawText(context: Context, layer: Sketch.Text) {
  const { canvas, CanvasKit } = context;

  const paragraphStyle = new CanvasKit.ParagraphStyle({
    textStyle: {
      color: CanvasKit.BLACK,
      fontFamilies: ['Roboto'],
    },
    textAlign: CanvasKit.TextAlign.Left,
    // maxLines: 7,
    // ellipsis: '...',
  });

  const builder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontManager);

  layer.attributedString.attributes.forEach((attribute) => {
    const { location, length } = attribute;
    const string = layer.attributedString.string.substr(location, length);
    const style = Primitives.stringAttribute(CanvasKit, attribute);
    builder.pushStyle(style);
    builder.addText(string);
    builder.pop();
  });

  const paragraph = builder.build();
  paragraph.layout(layer.frame.width);

  canvas.drawParagraph(paragraph, layer.frame.x, layer.frame.y);
}

export function drawLayerShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const path = Primitives.path(CanvasKit, layer.points, layer.frame);

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return;

  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  fills.forEach((fill) => {
    if (!fill.isEnabled) return;

    canvas.drawPath(path, Primitives.fill(CanvasKit, fill));
  });

  borders.forEach((border) => {
    if (!border.isEnabled || border.thickness === 0) return;

    const paint = Primitives.border(CanvasKit, border);

    drawBorderPath(context, paint, path, border.position);
  });
}

export function drawBorderPath(
  context: Context,
  paint: Paint,
  path: Path,
  position: Sketch.BorderPosition,
) {
  const { CanvasKit, canvas } = context;

  let originalThickness = paint.getStrokeWidth();

  canvas.save();

  // To change border position, we first draw the path and then
  // set it as the clip path. Then, increase the paint size by
  // 2x to compensate for the part of the path that gets cut out
  //
  // See: https://groups.google.com/g/skia-discuss/c/fE7qzKejMng
  switch (position) {
    case Sketch.BorderPosition.Outside:
      paint.setStrokeWidth(originalThickness * 2);
      canvas.clipPath(path, CanvasKit.ClipOp.Difference, true);
      break;
    case Sketch.BorderPosition.Center:
      break;
    case Sketch.BorderPosition.Inside:
      paint.setStrokeWidth(originalThickness * 2);
      canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
      break;
  }

  canvas.drawPath(path, paint);
  canvas.restore();

  paint.setStrokeWidth(originalThickness);
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
