import * as CanvasKit from 'canvaskit';
import { insetRect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  getDragHandles,
  getLineDragHandles,
  Layers,
  Primitives,
  Rect,
  Selectors,
} from 'noya-state';
import React, { memo } from 'react';
import { useApplicationState } from '../../../noya-app-state-context/src';
import { isPointsLayer } from '../../../noya-state/src/layers';
import { isLine } from '../../../noya-state/src/selectors/pointSelectors';
import { Rect as RCKRect } from '../ComponentsContext';

interface Props {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}

export default memo(function DragHandles({ selectionPaint, rect }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();

  const dragHandlePaint = useColorFill(CanvasKit.Color(255, 255, 255, 1));

  let dragHandles = getDragHandles(rect);

  let isShapeALine = false;

  if (state.selectedObjects.length === 1) {
    const page = Selectors.getCurrentPage(state);
    const indexPath = Layers.findIndexPath(
      page,
      (layer) => layer.do_objectID === state.selectedObjects[0],
    );

    if (indexPath) {
      const layer = Layers.access(page, indexPath);
      isShapeALine = isPointsLayer(layer) ? isLine(layer.points) : false;

      if (isShapeALine && isPointsLayer(layer)) {
        dragHandles = getLineDragHandles(layer.frame, layer.points);
      }
    }
  }

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
