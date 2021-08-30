import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { TextSelectionRange } from './textEditorSelectors';

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

export function setAttributesInRange(
  attributedString: Sketch.AttributedString,
  range: [number, number],
  attributesOrUpdater:
    | Partial<Sketch.StringAttribute['attributes']>
    | ((
        attributes: Sketch.StringAttribute['attributes'],
      ) => Sketch.StringAttribute['attributes']),
) {
  range = normalizeRange(range);

  const spans = toTextSpansWithPositions(attributedString);

  const updated = spans
    .flatMap((span) => {
      const start = range[0] - span.location;
      const end = range[1] - span.location;

      const clampedStart = Math.max(start, 0);
      const clampedEnd = Math.max(end, 0);

      return [
        {
          attributes: span.attributes,
          string: span.string.slice(0, clampedStart),
        },
        {
          attributes: {
            ...span.attributes,
            ...(typeof attributesOrUpdater === 'function'
              ? attributesOrUpdater(span.attributes)
              : attributesOrUpdater),
          },
          string: span.string.slice(clampedStart, clampedEnd),
        },
        {
          attributes: span.attributes,
          string: span.string.slice(clampedEnd),
        },
      ];
    })
    .filter((span) => span.string !== '');

  return fromTextSpans(updated);
}

export function getAttributesInRange(
  attributedString: Sketch.AttributedString,
  range: [number, number],
) {
  range = normalizeRange(range);

  const spans = toTextSpansWithPositions(attributedString);

  const updated = spans.filter((span, i) => {
    const start = range[0] - span.location;
    const end = range[1] - span.location;

    // If empty range
    if (range[0] === range[1]) {
      return (
        // Span start is within range
        (start >= 0 && start < span.length) ||
        // Cursor is after last span
        (i === spans.length - 1 && end === span.length)
      );
    }

    return (
      // Span start is within range
      (start >= 0 && start < span.length) ||
      // Entire span is between range
      (start < 0 && end > span.length) ||
      // Span end is within range
      (end > 0 && end < span.length)
    );
  });

  return updated.map((span) =>
    SketchModel.stringAttribute({
      attributes: span.attributes,
      location: span.location,
      length: span.string.length,
    }),
  );
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
