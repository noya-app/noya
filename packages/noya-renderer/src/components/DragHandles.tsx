import { useApplicationState } from 'noya-app-state-context';
import { Rect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit, useZoom } from 'noya-renderer';
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
  const zoom = useZoom();

  const dragHandleFill = useColorFill('#FFF');

  const lineLayer = Selectors.getSelectedLineLayer(state);

  const dragHandles =
    lineLayer && state.selectedLayerIds.length === 1
      ? getLineDragHandles(
          rect,
          lineLayer.points,
          lineLayer.isFlippedHorizontal,
          lineLayer.isFlippedVertical,
          zoom,
        )
      : getRectDragHandles(rect, zoom);

  const dropShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        1 / zoom,
        1 / zoom,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit, zoom],
  );

  return (
    <Group imageFilter={dropShadow}>
      {dragHandles.map((handle, index) => (
        <React.Fragment key={index}>
          <RCKRect
            rect={Primitives.rect(CanvasKit, pixelAlignRect(handle.rect, zoom))}
            paint={dragHandleFill}
          />
        </React.Fragment>
      ))}
    </Group>
  );
});
