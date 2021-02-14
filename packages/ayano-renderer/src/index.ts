import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState } from 'ayano-state';
import {
  getCurrentPage,
  getCurrentPageMetadata,
} from 'ayano-state/src/selectors';
import memoize from 'ayano-state/src/utils/memoize';
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
  state: ApplicationState;
  CanvasKit: CanvasKit;
  canvas: Canvas;
  theme: { textColor: string; backgroundColor: string };
}

let fontManager: FontMgr;

export function drawCanvas(context: Context) {
  const { CanvasKit, canvas, state, theme } = context;

  const page = getCurrentPage(state);
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  canvas.clear(CanvasKit.parseColorString(theme.backgroundColor));

  canvas.save();
  canvas.translate(scrollOrigin.x + state.canvasInsets.left, scrollOrigin.y);
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
    case 'bitmap':
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
    case 'bitmap':
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
    case 'bitmap':
      return drawBitmap(context, layer);
    case 'rectangle':
    case 'oval':
      return drawLayerShape(context, layer);
    default:
      console.log(layer._class, 'not handled');
      return;
  }
}

export function drawArtboard(context: Context, layer: Sketch.Artboard) {
  const { canvas, CanvasKit, theme } = context;

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

  const rect = Primitives.rect(CanvasKit, layer.frame);
  const blurRect = Primitives.rect(CanvasKit, {
    ...layer.frame,
    y: layer.frame.y + 1,
  });

  canvas.drawRect(blurRect, blur);
  canvas.drawRect(rect, paint);

  canvas.save();
  canvas.clipRect(rect, CanvasKit.ClipOp.Intersect, true);
  canvas.translate(layer.frame.x, layer.frame.y);

  layer.layers.forEach((child) => {
    drawLayer(context, child);
  });

  canvas.restore();

  // Render label

  const paragraphStyle = new CanvasKit.ParagraphStyle({
    textStyle: {
      color: CanvasKit.parseColorString(theme.textColor),
      fontSize: 11,
      fontFamilies: ['Roboto'],
      letterSpacing: 0.2,
    },
  });

  const builder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontManager);
  builder.addText(layer.name);
  const paragraph = builder.build();
  paragraph.layout(10000);

  canvas.drawParagraph(
    paragraph,
    layer.frame.x + 3,
    layer.frame.y - paragraph.getHeight() - 3,
  );
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

const decodeImage = memoize(
  (
    CanvasKit: CanvasKit,
    data: ArrayBuffer,
  ): ReturnType<CanvasKit['MakeImageFromEncoded']> => {
    return CanvasKit.MakeImageFromEncoded(data);
  },
);

export function drawBitmap(context: Context, layer: Sketch.Bitmap) {
  const { state, canvas, CanvasKit } = context;

  const ref = state.sketch.images[layer.image._ref];

  if (!ref) {
    console.log('Missing image ref', layer.image);
    return;
  }

  const image = decodeImage(CanvasKit, ref);
  // const image = CanvasKit.MakeImageFromEncoded(ref);

  if (!image) {
    console.log('Failed to decode image', layer.image);
    return;
  }

  const paint = new CanvasKit.Paint();

  // canvas.drawImageRect(
  //   image,
  //   CanvasKit.XYWHRect(0, 0, image.width(), image.height()),
  //   Primitives.rect(CanvasKit, layer.frame),
  //   paint,
  //   true,
  // );

  // Number parameters "B" and "C" are for tweaking the cubic resampler:
  // https://api.skia.org/SkSamplingOptions_8h_source.html
  canvas.drawImageRectCubic(
    image,
    CanvasKit.XYWHRect(0, 0, image.width(), image.height()),
    Primitives.rect(CanvasKit, layer.frame),
    0,
    0,
    paint,
  );
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
