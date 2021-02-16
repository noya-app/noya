import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FontMgr } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';
import { renderLayer } from './layer';

export function renderArtboard(
  context: Context,
  fontManager: FontMgr,
  layer: Sketch.Artboard,
) {
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
    renderLayer(context, fontManager, child);
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
