import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, FontMgr } from 'canvaskit';
import {
  AffineTransform,
  insetRect,
  Point,
  rectContainsPoint,
} from 'noya-geometry';
import {
  InteractionState,
  Layers,
  Primitives,
  Selectors,
  TextSelectionRange,
} from 'noya-state';
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
  fontManager: FontMgr,
  layer: Sketch.Text,
) {
  const {
    fontSize,
    lineHeight,
    textHorizontalAlignment,
    textTransform,
    textDecoration,
  } = getTextStyleAttributes(layer);

  const heightMultiplier = lineHeight ? lineHeight / fontSize : undefined;

  const paragraphStyle = new CanvasKit.ParagraphStyle({
    // Note: We can put a heightMultiplier in text style, but it has no effect
    textStyle: {
      color: CanvasKit.BLACK,
      fontFamilies: ['Roboto'],
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
      fontFamilies: ['Roboto'],
      strutEnabled: true,
      forceStrutHeight: true,
      fontSize,
      heightMultiplier,
    },
  });

  const builder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontManager);

  toTextSpans(layer.attributedString).forEach((span) => {
    const style = Primitives.createCanvasKitTextStyle(
      CanvasKit,
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
  fontManager: FontMgr,
  state: ApplicationState,
  layerId: string,
  point: Point,
  mode: 'bounded' | 'unbounded',
) {
  const page = Selectors.getCurrentPage(state);
  const textLayer = Layers.find(page, (layer) => layer.do_objectID === layerId);

  if (!textLayer || !Layers.isTextLayer(textLayer)) return;

  const boundingRect = Selectors.getBoundingRect(
    page,
    AffineTransform.identity,
    [textLayer.do_objectID],
  );

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
  fontManager: FontMgr,
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
