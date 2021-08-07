import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, Paragraph } from 'canvaskit';
import { useApplicationState } from 'noya-app-state-context';
import { AffineTransform } from 'noya-geometry';
import { useColorFill, useDeletable } from 'noya-react-canvaskit';
import { Group, Rect, Text, useCanvasKit, useFontManager } from 'noya-renderer';
import { Selectors, TextSelectionRange } from 'noya-state';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'styled-components';

interface Props {
  layer: Sketch.Text;
}

export function useTextLayerParagraph(layer: Sketch.Text) {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const paragraph = useMemo(
    () => Selectors.getLayerParagraph(CanvasKit, fontManager, layer),
    [CanvasKit, fontManager, layer],
  );

  useDeletable(paragraph);

  return paragraph;
}

function TextSelection({
  paragraph,
  selectedRange,
}: {
  paragraph: Paragraph;
  selectedRange: TextSelectionRange;
}) {
  const CanvasKit = useCanvasKit();

  const selectionPaint = useColorFill(useTheme().colors.selection);

  const { anchor, head } = selectedRange;

  const [start, end] = Selectors.normalizeRange([anchor, head]);

  const rects = getRectsForRange(CanvasKit, paragraph, start, end);

  return (
    <>
      {rects.map((rect, i) => (
        <Rect key={i} rect={rect} paint={selectionPaint} />
      ))}
    </>
  );
}

function getRectsForRange(
  CanvasKit: CanvasKit,
  paragraph: Paragraph,
  start: number,
  end: number,
) {
  return (paragraph.getRectsForRange(
    start,
    end,
    CanvasKit.RectHeightStyle.Max,
    CanvasKit.RectWidthStyle.Max,
  ) as unknown) as Float32Array[];
}

function getCursorRect(
  CanvasKit: CanvasKit,
  paragraph: Paragraph,
  index: number,
) {
  let rects = getRectsForRange(CanvasKit, paragraph, index, index + 1);

  if (rects.length > 0) {
    const firstRect = rects[0];

    return CanvasKit.LTRBRect(
      firstRect[0],
      firstRect[1],
      firstRect[0] + 1,
      firstRect[3],
    );
  }

  rects = getRectsForRange(CanvasKit, paragraph, index - 1, index);

  if (rects.length > 0) {
    const firstRect = rects[0];

    return CanvasKit.LTRBRect(
      firstRect[2],
      firstRect[1],
      firstRect[2] + 1,
      firstRect[3],
    );
  }
}

function TextCursor({
  paragraph,
  index,
}: {
  paragraph: Paragraph;
  index: number;
}) {
  const CanvasKit = useCanvasKit();

  const cursorPaint = useColorFill(useTheme().colors.text);

  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setCursorVisible(true);
  }, [
    index, // When index changes, we set the cursor to visible
  ]);

  useEffect(() => {
    const intervalId = setTimeout(() => {
      setCursorVisible(!cursorVisible);
    }, 400);

    return () => clearTimeout(intervalId);
  }, [cursorVisible]);

  if (!cursorVisible) return null;

  const cursorRect = getCursorRect(CanvasKit, paragraph, index);

  if (!cursorRect) return null;

  return <Rect rect={cursorRect} paint={cursorPaint} />;
}

export default memo(function SketchText({ layer }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();

  const paragraph = useTextLayerParagraph(layer);

  const rect = useMemo(
    () => CanvasKit.XYWHRect(0, 0, layer.frame.width, layer.frame.height),
    [CanvasKit, layer.frame],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const transform = AffineTransform.translate(layer.frame.x, layer.frame.y);

  return (
    <Group opacity={opacity} transform={transform}>
      {state.selectedText?.layerId === layer.do_objectID && (
        <TextSelection
          paragraph={paragraph}
          selectedRange={state.selectedText.range}
        />
      )}
      <Text paragraph={paragraph} rect={rect} />
      {state.selectedText?.layerId === layer.do_objectID && (
        <TextCursor
          paragraph={paragraph}
          index={state.selectedText.range.head}
        />
      )}
    </Group>
  );
});
