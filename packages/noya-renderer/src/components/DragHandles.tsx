import React, { memo, useMemo } from 'react';
import { useApplicationState } from 'noya-app-state-context';
import { Rect } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { getDragHandles, Primitives } from 'noya-state';
import { Group, Rect as RCKRect } from '../contexts/ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { pixelAlignRect } from '../utils/pixelAlignment';

interface Props {
  rect: Rect;
}

export default memo(function DragHandles({ rect }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();
  // const zoom = useZoom();

  const dragHandleFill = useColorFill('#FFF');

  const dragHandles = getDragHandles(state, rect, 1); // zoom);

  const dropShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        1, // / zoom,
        1, // / zoom,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit], // , zoom],
  );

  return (
    <Group imageFilter={dropShadow}>
      {dragHandles.map((handle, index) => (
        <React.Fragment key={index}>
          <RCKRect
            rect={Primitives.rect(CanvasKit, pixelAlignRect(handle.rect, 1))} // zoom))}
            paint={dragHandleFill}
          />
        </React.Fragment>
      ))}
    </Group>
  );
});
