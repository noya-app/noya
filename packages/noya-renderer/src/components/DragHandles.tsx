import { useApplicationState } from 'noya-app-state-context';
import { insetRect, Rect } from 'noya-geometry';
import { useFill, useStroke } from 'noya-react-canvaskit';
import { getDragHandles, Primitives } from 'noya-state';
import React, { memo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { pixelAlignRect } from '../pixelAlignment';
import { useZoom } from '../ZoomContext';

interface Props {
  rect: Rect;
}

export default memo(function DragHandles({ rect }: Props) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();
  const zoom = useZoom();
  const {
    canvas: { selectionStroke },
  } = useTheme().colors;

  const dragHandleFill = useFill({
    color: '#FFFFFF',
    strokeWidth: 1 / zoom,
  });
  const dragHandleStroke = useStroke({
    color: selectionStroke,
    strokeWidth: 1 / zoom,
  });

  const dragHandles = getDragHandles(state, rect, zoom);

  return (
    <>
      {dragHandles.map((handle, index) => {
        const rect = pixelAlignRect(handle.rect, zoom);

        return (
          <React.Fragment key={index}>
            <RCKRect
              rect={Primitives.rect(CanvasKit, rect)}
              paint={dragHandleFill}
            />
            <RCKRect
              rect={Primitives.rect(CanvasKit, insetRect(rect, -0.5 / zoom))}
              paint={dragHandleStroke}
            />
          </React.Fragment>
        );
      })}
    </>
  );
});
