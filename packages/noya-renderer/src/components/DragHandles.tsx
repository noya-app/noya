import { useApplicationState } from 'noya-app-state-context';
import { Rect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  getLineDragHandles,
  getRectDragHandles,
  Primitives,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo } from 'react';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import { pixelAlignRect } from '../pixelAlignment';

interface Props {
  rect: Rect;
}

export default memo(function DragHandles({ rect }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();

  const dragHandleFill = useColorFill('#FFF');

  const lineLayer = Selectors.getSelectedLineLayer(state);

  const dragHandles =
    lineLayer && state.selectedLayerIds.length === 1
      ? getLineDragHandles(lineLayer.frame, lineLayer.points, lineLayer)
      : getRectDragHandles(rect);

  const dropShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        1,
        1,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit],
  );

  return (
    <Group imageFilter={dropShadow}>
      {dragHandles.map((handle, index) => (
        <React.Fragment key={index}>
          <RCKRect
            rect={Primitives.rect(CanvasKit, pixelAlignRect(handle.rect))}
            paint={dragHandleFill}
          />
        </React.Fragment>
      ))}
    </Group>
  );
});
