import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'styled-components';

import { CanvasKit, Paragraph } from 'canvaskit-types';
import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { useColorFill, useDeletable } from 'noya-react-canvaskit';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Selectors, TextSelectionRange } from 'noya-state';
import { Group, Rect, Text } from '../../contexts/ComponentsContext';
import { useFontManager } from '../../contexts/FontManagerContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { getLuminance } from '../../utils/colorMatrix';
import BlurGroup from '../effects/BlurGroup';

function useNearestBackgroundColor(layer: Sketch.Text) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();
  const canvasColor = useTheme().colors.canvas.background;

  return useMemo(() => {
    const page = Selectors.getCurrentPage(state);
    const indexPath = Layers.findIndexPath(
      page,
      (l) => l.do_objectID === layer.do_objectID,
    );
    const parsedBackgroundColor = CanvasKit.parseColorString(canvasColor);

    if (!indexPath) return parsedBackgroundColor;

    const artboard = page.layers[indexPath[0]];

    if (!Layers.isSymbolMasterOrArtboard(artboard))
      return parsedBackgroundColor;

    const { red, green, blue, alpha } = artboard.backgroundColor;

    return new Float32Array([red, green, blue, alpha]);
  }, [CanvasKit, canvasColor, layer.do_objectID, state]);
}

function useCursorColor(layer: Sketch.Text) {
  const CanvasKit = useCanvasKit();

  const layerTextColor =
    layer.style?.textStyle?.encodedAttributes
      .MSAttributedStringColorAttribute ?? SketchModel.BLACK;

  const foregroundColor = useMemo(
    () =>
      new Float32Array([
        layerTextColor.red,
        layerTextColor.green,
        layerTextColor.blue,
        layerTextColor.alpha,
      ]),
    [layerTextColor],
  );

  const backgroundColor = useNearestBackgroundColor(layer);

  const backgroundLuminance = getLuminance(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
  );

  const foregroundLuminance = getLuminance(
    foregroundColor[0],
    foregroundColor[1],
    foregroundColor[2],
  );

  const contrastRatio =
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);

  if (contrastRatio < 2) {
    return backgroundLuminance < 0.5 ? CanvasKit.WHITE : CanvasKit.BLACK;
  }

  return foregroundColor;
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
  return paragraph.getRectsForRange(
    start,
    end,
    CanvasKit.RectHeightStyle.Max,
    CanvasKit.RectWidthStyle.Max,
  ) as unknown as Float32Array[];
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
  layer,
  paragraph,
  index,
}: {
  layer: Sketch.Text;
  paragraph: Paragraph;
  index: number;
}) {
  const CanvasKit = useCanvasKit();

  const cursorColor = useCursorColor(layer);
  const cursorPaint = useColorFill(cursorColor);

  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setCursorVisible(true);
  }, [
    index, // When index changes, we set the cursor to visible
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCursorVisible(!cursorVisible);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    cursorVisible,
    index, // When index changes, we clear the timeout
  ]);

  if (!cursorVisible) return null;

  const cursorRect = getCursorRect(CanvasKit, paragraph, index);

  if (!cursorRect) return null;

  return <Rect rect={cursorRect} paint={cursorPaint} />;
}

interface Props {
  layer: Sketch.Text;
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

  const selectedText = Selectors.getTextSelection(state);

  const blur = useMemo(
    () => layer.style?.blur ?? SketchModel.blur({ isEnabled: false }),
    [layer.style?.blur],
  );

  return (
    <BlurGroup blur={blur}>
      <Group opacity={opacity} transform={transform}>
        {selectedText?.layerId === layer.do_objectID && (
          <TextSelection
            paragraph={paragraph}
            selectedRange={selectedText.range}
          />
        )}
        <Text paragraph={paragraph} rect={rect} />
        {selectedText?.layerId === layer.do_objectID && (
          <TextCursor
            layer={layer}
            paragraph={paragraph}
            index={selectedText.range.head}
          />
        )}
      </Group>
    </BlurGroup>
  );
});
