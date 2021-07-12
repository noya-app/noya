import * as CanvasKit from 'canvaskit';
import { insetRect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  Rect,
  Primitives,
  getDragHandles,
  Layers,
  Selectors,
  decodeCurvePoint,
  dragHandelSize,
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
  const dragHandles = getDragHandles(rect);

  let isShapeALine = false;

  const page = Selectors.getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === state.selectedObjects[0],
  );

  if (indexPath) {
    const layer = Layers.access(page, indexPath);
    isShapeALine = isPointsLayer(layer) ? isLine(layer.points) : false;

    if (isShapeALine && isPointsLayer(layer)) {
      dragHandles.forEach(function (handle) {
        const startDecodedPoint = decodeCurvePoint(
          layer.points[0],
          layer.frame,
        );
        const endDecodedPoint = decodeCurvePoint(layer.points[1], layer.frame);

        if (handle.compassDirection === 'e') {
          handle.rect.x = startDecodedPoint.point.x - dragHandelSize / 2;
          handle.rect.y = startDecodedPoint.point.y - dragHandelSize / 2;
        }
        if (handle.compassDirection === 'w') {
          handle.rect.x = endDecodedPoint.point.x - dragHandelSize / 2;
          handle.rect.y = endDecodedPoint.point.y - dragHandelSize / 2;
        }
      });
    }
  }

  return (
    <>
      {dragHandles
        .filter((handle) =>
          isShapeALine
            ? handle.compassDirection === 'e' || handle.compassDirection === 'w'
            : handle.compassDirection,
        )
        .map((handle) => (
          <React.Fragment key={handle.compassDirection}>
            <RCKRect
              rect={Primitives.rect(CanvasKit, handle.rect)}
              paint={dragHandlePaint}
            />
            <RCKRect
              rect={Primitives.rect(
                CanvasKit,
                insetRect(handle.rect, 0.5, 0.5),
              )}
              paint={selectionPaint}
            />
          </React.Fragment>
        ))}
    </>
  );
});
