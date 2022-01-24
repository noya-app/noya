import { CanvasKit } from 'canvaskit';
import Sketch from 'noya-file-format';
import { SYSTEM_FONT_ID } from 'noya-fonts';
import {
  AffineTransform,
  createBounds,
  insetRect,
  Point,
  Rect,
  rectContainsPoint,
  Size,
} from 'noya-geometry';
import { IFontManager } from 'noya-renderer';
import {
  InteractionState,
  Layers,
  Primitives,
  Selectors,
  TextSelectionRange,
} from 'noya-state';
import { memoize, unique } from 'noya-utils';
import { ApplicationState } from '../reducers/applicationReducer';
import { toTextSpans } from './attributedStringSelectors';
import { getTextStyleAttributes } from './textStyleSelectors';

export const getIsEditingText = (type: InteractionState['type']): boolean => {
  return (
    type === 'editingText' ||
    type === 'maybeSelectingText' ||
    type === 'selectingText'
  );
};

export const hasTextSelection = (
  interactionState: InteractionState,
): interactionState is Extract<
  InteractionState,
  { type: 'editingText' | 'maybeSelectingText' | 'selectingText' }
> => {
  return (
    interactionState.type === 'editingText' ||
    interactionState.type === 'maybeSelectingText' ||
    interactionState.type === 'selectingText'
  );
};

export type TextSelection = {
  layerId: string;
  range: TextSelectionRange;
};

export function getTextSelection(
  state: ApplicationState,
): TextSelection | undefined {
  if (!Selectors.hasTextSelection(state.interactionState)) return;

  const { layerId, range } = state.interactionState;

  return { layerId, range };
}

export function applyTextTransform(
  text: string,
  transform: Sketch.TextTransform,
) {
  switch (transform) {
    case Sketch.TextTransform.None:
      return text;
    case Sketch.TextTransform.Lowercase:
      return text.toLowerCase();
    case Sketch.TextTransform.Uppercase:
      return text.toUpperCase();
  }
}

export function getLayerParagraph(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  layer: Sketch.Text,
) {
  const {
    fontNames,
    fontSize,
    lineHeight,
    textHorizontalAlignment,
    textTransform,
    textDecoration,
  } = getTextStyleAttributes(layer);

  const heightMultiplier = lineHeight ? lineHeight / fontSize : undefined;

  const registeredFontFamilies = unique([
    ...fontNames.flatMap((fontName) => {
      const id = fontManager.getFontId(fontName);
      return id ? [id] : [];
    }),
    SYSTEM_FONT_ID,
  ]);

  const paragraphStyle = new CanvasKit.ParagraphStyle({
    // Note: We can put a heightMultiplier in text style, but it has no effect
    textStyle: {
      color: CanvasKit.BLACK,
      fontFamilies: registeredFontFamilies,
      fontSize,
    },
    textAlign: Primitives.textHorizontalAlignment(
      CanvasKit,
      textHorizontalAlignment,
    ),
    // TODO:
    // Using a strut for line height is somewhat different from how Sketch works.
    // Sketch does not apply the additional height to the first line, so we may
    // want to handle this differently or move the whole paragraph up to compensate.
    //
    // For more on struts: https://en.wikipedia.org/wiki/Strut_(typesetting)
    strutStyle: {
      fontFamilies: registeredFontFamilies,
      strutEnabled: true,
      forceStrutHeight: true,
      fontSize,
      heightMultiplier,
    },
  });

  const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(
    paragraphStyle,
    fontManager.getTypefaceFontProvider(),
  );

  toTextSpans(layer.attributedString).forEach((span) => {
    const style = Primitives.createCanvasKitTextStyle(
      CanvasKit,
      fontManager.getFontId(
        span.attributes.MSAttributedStringFontAttribute.attributes.name,
      ) ?? SYSTEM_FONT_ID,
      span.attributes,
      textDecoration,
    );
    builder.pushStyle(style);
    builder.addText(applyTextTransform(span.string, textTransform));
    builder.pop();
  });

  const paragraph = builder.build();

  builder.delete();

  paragraph.layout(layer.frame.width);

  return paragraph;
}

export function getCharacterIndexAtPoint(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  state: ApplicationState,
  layerId: string,
  point: Point,
  mode: 'bounded' | 'unbounded',
) {
  const page = Selectors.getCurrentPage(state);
  const textLayer = Layers.find(page, (layer) => layer.do_objectID === layerId);

  if (!textLayer || !Layers.isTextLayer(textLayer)) return;

  const boundingRect = Selectors.getBoundingRect(page, [textLayer.do_objectID]);

  if (!boundingRect) return;

  const slopRect = insetRect(boundingRect, -20);

  if (mode === 'bounded' && !rectContainsPoint(slopRect, point)) return;

  const paragraph = Selectors.getLayerParagraph(
    CanvasKit,
    fontManager,
    textLayer,
  );

  const position = paragraph.getGlyphPositionAtCoordinate(
    point.x - boundingRect.x,
    point.y - boundingRect.y,
  );

  return position.pos;
}

export function getCharacterIndexAtPointInSelectedLayer(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  state: ApplicationState,
  point: Point,
  mode: 'bounded' | 'unbounded',
) {
  const selection = getTextSelection(state);

  if (!selection) return;

  return getCharacterIndexAtPoint(
    CanvasKit,
    fontManager,
    state,
    selection.layerId,
    point,
    mode,
  );
}

export function getArtboardLabelParagraph(
  CanvasKit: CanvasKit,
  fontManager: IFontManager,
  text: string,
  textColor: string = 'black',
) {
  const paragraphStyle = new CanvasKit.ParagraphStyle({
    textStyle: {
      color: CanvasKit.parseColorString(textColor),
      fontSize: 11,
      fontFamilies: [SYSTEM_FONT_ID],
      letterSpacing: 0.2,
    },
  });

  const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(
    paragraphStyle,
    fontManager.getTypefaceFontProvider(),
  );
  builder.addText(text);

  const paragraph = builder.build();
  paragraph.layout(10000);

  builder.delete();

  return paragraph;
}

export const getArtboardLabelParagraphSize = memoize(
  function getArtboardLabelParagraphSize(
    CanvasKit: CanvasKit,
    fontManager: IFontManager,
    text: string,
  ): Size {
    const paragraph = getArtboardLabelParagraph(CanvasKit, fontManager, text);

    const size = {
      width: paragraph.getMaxIntrinsicWidth(),
      height: paragraph.getHeight(),
    };

    paragraph.delete();

    return size;
  },
);

export function getArtboardLabelRect(
  layerFrame: Rect,
  paragraphSize: Size,
): Rect {
  return {
    x: layerFrame.x,
    y: layerFrame.y - paragraphSize.height,
    width: paragraphSize.width,
    height: paragraphSize.height,
  };
}

export function getArtboardLabelTransform(rect: Rect, zoom: number) {
  const bounds = createBounds(rect);

  return AffineTransform.scale(1 / zoom, 1 / zoom, {
    x: bounds.minX,
    y: bounds.maxY,
  }).translate(3, -4);
}
