import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchModel } from 'noya-sketch-model';
import { TextSelectionRange } from './textEditorSelectors';

export const MAX_TEXT_LAYER_STRING_LENGTH = 1_000_000;

type TextSpan = {
  string: string;
  attributes: Sketch.StringAttribute['attributes'];
};

export function toTextSpans(
  attributedString: Sketch.AttributedString,
): TextSpan[] {
  return attributedString.attributes.map(
    ({ location, length, attributes }) => ({
      string: attributedString.string.substr(location, length),
      attributes,
    }),
  );
}

function toTextSpansWithPositions(
  attributedString: Sketch.AttributedString,
): (TextSpan & { location: number; length: number })[] {
  return attributedString.attributes.map(
    ({ location, length, attributes }) => ({
      string: attributedString.string.substr(location, length),
      attributes,
      location,
      length,
    }),
  );
}

export function fromTextSpans<T extends TextSpan>(
  textSpans: T[],
): Sketch.AttributedString {
  const attributedString = SketchModel.attributedString({ attributes: [] });
  let totalLength = 0;
  textSpans.forEach((span: TextSpan) => {
    attributedString.string += span.string;
    attributedString.attributes.push(
      SketchModel.stringAttribute({
        attributes: span.attributes,
        location: totalLength,
        length: span.string.length,
      }),
    );
    totalLength += span.string.length;
  });
  return attributedString;
}

export function normalizeRange(range: [number, number]): [number, number] {
  return [Math.min(...range), Math.max(...range)];
}

export function replaceTextInRange(
  attributedString: Sketch.AttributedString,
  range: [number, number],
  text: string,
  defaultAttributes: Sketch.StringAttribute['attributes'],
) {
  if (attributedString.string.length === 0) {
    return fromTextSpans([
      {
        string: text,
        attributes: defaultAttributes,
      },
    ]);
  }

  range = normalizeRange(range);
  const spans = toTextSpansWithPositions(attributedString);

  const updated = spans
    .map((span, i) => {
      const start = range[0] - span.location;
      const end = range[1] - span.location;

      const shouldInsert =
        start >= 0 && (start < span.length || i === spans.length - 1);

      return {
        attributes: span.attributes,
        string:
          span.string.slice(0, Math.max(start, 0)) +
          (shouldInsert ? text : '') +
          span.string.slice(Math.max(end, 0)),
      };
    })
    .filter((span) => span.string !== '');

  return fromTextSpans(updated);
}

export function replaceTextAndUpdateSelectionRange(
  attributedString: Sketch.AttributedString,
  selectionRange: TextSelectionRange,
  textToInsert: string,
  defaultAttributes: Sketch.StringAttribute['attributes'],
) {
  const location =
    Math.min(selectionRange.anchor, selectionRange.head) + textToInsert.length;

  const range = { anchor: location, head: location };

  return {
    attributedString: replaceTextInRange(
      attributedString,
      [selectionRange.anchor, selectionRange.head],
      textToInsert,
      defaultAttributes,
    ),
    range,
  };
}
