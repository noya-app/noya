import * as CanvasKit from 'canvaskit';
import { insetRect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  getLineDragHandles,
  getRectDragHandles,
  Primitives,
  Rect,
  Selectors,
} from 'noya-state';
import React, { memo } from 'react';
import { useApplicationState } from '../../../noya-app-state-context/src';
import { Rect as RCKRect } from '../ComponentsContext';

interface Props {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}

export default memo(function DragHandles({ selectionPaint, rect }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();

  const dragHandlePaint = useColorFill(CanvasKit.Color(255, 255, 255, 1));

  const lineLayer = Selectors.getSelectedLineLayer(state);
  const dragHandles =
    lineLayer && state.selectedObjects.length === 1
      ? getLineDragHandles(lineLayer.frame, lineLayer.points, lineLayer)
      : getRectDragHandles(rect);

  return (
    <>
      {dragHandles.map((handle, index) => (
        <React.Fragment key={index}>
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
