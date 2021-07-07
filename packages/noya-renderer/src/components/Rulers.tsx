import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { useWorkspace } from 'app/src/hooks/useWorkspace';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { Point, Selectors } from 'noya-state';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Rect, Text } from '..';

function RulerLabel({ text, origin }: { text: string; origin: Point }) {
  const CanvasKit = useCanvasKit();
  const textColor = useTheme().colors.textMuted;
  const fontManager = useFontManager();

  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString(textColor),
        fontSize: 11,
        fontFamilies: ['Roboto'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(text);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, text, textColor]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        origin.x,
        origin.y,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph, origin.x, origin.y],
  );

  return <Text rect={labelRect} paragraph={paragraph} />;
}

function range(
  min: number,
  max: number,
  stride: number,
  snapTo: number = 1,
): number[] {
  const values: number[] = [];

  const remainder = min % snapTo;
  const start = remainder === 0 ? min : min - remainder;

  for (let n = start; n <= max; n += stride) {
    values.push(n);
  }

  return values;
}

export function HorizontalRuler() {
  const CanvasKit = useCanvasKit();
  const backgroundColor = useTheme().colors.canvas.background;

  const [state] = useApplicationState();
  const { canvasSize } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const { scrollOrigin } = Selectors.getCurrentPageMetadata(state);

  const rulerRect = useMemo(
    () => CanvasKit.XYWHRect(0, 0, canvasSize.width, 25),
    [CanvasKit, canvasSize.width],
  );
  const dividerRect = useMemo(
    () => CanvasKit.XYWHRect(0, 24, canvasSize.width, 1),
    [CanvasKit, canvasSize.width],
  );

  const backgroundPaint = useColorFill(backgroundColor);
  const dividerPaint = useColorFill('#555');

  const markOffset = page.horizontalRulerData.base;
  const marks = range(-100 + markOffset, canvasSize.width + 100, 100);

  return (
    <>
      <Rect rect={rulerRect} paint={backgroundPaint} />
      <Rect rect={dividerRect} paint={dividerPaint} />
      {marks.map((mark, index) => {
        const x = mark + scrollOrigin.x;

        return (
          <React.Fragment key={index}>
            <Rect rect={CanvasKit.XYWHRect(x, 0, 1, 25)} paint={dividerPaint} />
            <RulerLabel
              origin={{ x: x + 5, y: 0 }}
              text={(mark - markOffset).toString()}
            />
          </React.Fragment>
        );
      })}
      <RulerLabel
        origin={{ x: 5, y: 10 }}
        text={`(base: ${markOffset}, scroll: ${scrollOrigin.x})`}
      />
    </>
  );
}
