import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Paragraph } from 'canvaskit';
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

  const rects = (paragraph.getRectsForRange(
    anchor,
    head,
    CanvasKit.RectHeightStyle.Max,
    CanvasKit.RectWidthStyle.Max,
  ) as unknown) as Float32Array[];

  // console.log('range', rects, anchor, head);

  return (
    <>
      {rects.map((rect, i) => (
        <Rect key={i} rect={rect} paint={selectionPaint} />
      ))}
    </>
  );
}

function TextCursor({
  paragraph,
  selectedRange,
}: {
  paragraph: Paragraph;
  selectedRange: TextSelectionRange;
}) {
  const CanvasKit = useCanvasKit();

  const cursorPaint = useColorFill(useTheme().colors.text);

  const { anchor, head } = selectedRange;

  const [cursorVisible, setCursorVisible] = useState(true);

  // When head or anchor change, we set the cursor to visible
  useEffect(() => {
    setCursorVisible(head === anchor);
  }, [head, anchor]);

  useEffect(() => {
    const intervalId = setTimeout(() => {
      setCursorVisible(!cursorVisible);
    }, 400);

    return () => clearTimeout(intervalId);
  }, [cursorVisible]);

  if (!cursorVisible || anchor !== head) return null;

  const lineMetrics = paragraph
    .getLineMetrics()
    .find((lm) => lm.startIndex <= head && lm.endIndex >= head);

  if (!lineMetrics) return null;

  const rects = (paragraph.getRectsForRange(
    head,
    head + 1,
    CanvasKit.RectHeightStyle.Max,
    CanvasKit.RectWidthStyle.Max,
  ) as unknown) as Float32Array[];

  // console.log('cursor', rects);

  // console.log('lm', lineMetrics, paragraph.getShapedLines());

  return (
    <>
      {rects.map((rect, i) => (
        <Rect
          key={i}
          rect={CanvasKit.LTRBRect(rect[0], rect[1], rect[0] + 1, rect[3])}
          paint={cursorPaint}
        />
      ))}
    </>
  );

  // return (
  //   <Rect
  //     rect={CanvasKit.XYWHRect(lineMetrics.left, 0, 1, lineMetrics.height)}
  //     paint={cursorPaint}
  //   />
  // );
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
          selectedRange={state.selectedText.range}
        />
      )}
    </Group>
  );
});
