import { range } from '@noya-app/noya-utils';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { useColorFill } from 'noya-react-canvaskit';
import { Selectors } from 'noya-state';
import React from 'react';
import { useTheme } from 'styled-components';
import { Rect } from '../ComponentsContext';
import { useZoom } from '../ZoomContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

export const SHOW_PIXELS_ZOOM_THRESHOLD = 5;

export function PixelGrid() {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const [state] = useApplicationState();
  const { canvasSize } = useWorkspace();
  const { scrollOrigin } = Selectors.getCurrentPageMetadata(state);
  const gridColor = useTheme().colors.canvas.grid;
  const fillPaint = useColorFill(gridColor);

  // If we ever allow a different kind of grid, we still need to check
  // for zoom === 0, so I've left this redundant check as a reminder.
  if (zoom === 0 || zoom < SHOW_PIXELS_ZOOM_THRESHOLD) return <></>;

  const xOffset = -zoom * Math.floor(scrollOrigin.x / zoom);
  const yOffset = -zoom * Math.floor(scrollOrigin.y / zoom);

  const verticalLineXValues = range(
    0 + scrollOrigin.x + xOffset,
    canvasSize.width,
    zoom,
  ).map(Math.floor);

  const horizontalLineYValues = range(
    0 + scrollOrigin.y + yOffset,
    canvasSize.height,
    zoom,
  ).map(Math.floor);

  return (
    <>
      {verticalLineXValues.map((x, index) => (
        <Rect
          key={`x-${index}`}
          paint={fillPaint}
          rect={CanvasKit.XYWHRect(x, 0, 1, canvasSize.height)}
        />
      ))}
      {horizontalLineYValues.map((y, index) => (
        <Rect
          key={`y-${index}`}
          paint={fillPaint}
          rect={CanvasKit.XYWHRect(0, y, canvasSize.width, 1)}
        />
      ))}
    </>
  );
}
