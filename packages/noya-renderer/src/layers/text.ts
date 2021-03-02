import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { FontMgr } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';

export function renderText(
  context: Context,
  fontManager: FontMgr,
  layer: Sketch.Text,
) {
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
