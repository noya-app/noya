import * as CanvasKit from 'canvaskit';
import { insetRect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { Primitives, useCanvasKit } from 'noya-renderer';
import { Rect } from 'noya-state';
import React, { memo } from 'react';
import { getDragHandles } from '../canvas/selection';
import { Rect as RCKRect } from '../ComponentsContext';

interface Props {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}

export default memo(function DragHandles({ selectionPaint, rect }: Props) {
  const CanvasKit = useCanvasKit();

  const dragHandlePaint = useColorFill(CanvasKit.Color(255, 255, 255, 1));
  const dragHandles = getDragHandles(rect);

  return (
    <>
      {dragHandles.map((handle) => (
        <React.Fragment key={handle.compassDirection}>
          <RCKRect
            rect={Primitives.rect(CanvasKit, handle.rect)}
            paint={dragHandlePaint}
          />
          <RCKRect
            rect={Primitives.rect(CanvasKit, insetRect(handle.rect, 0.5, 0.5))}
            paint={selectionPaint}
          />
        </React.Fragment>
      ))}
    </>
  );
});
