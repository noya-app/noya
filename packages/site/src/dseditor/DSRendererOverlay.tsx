import React, { memo } from 'react';
import { IDSRenderer } from './DSRenderer';

interface Props {
  rendererRef: React.RefObject<IDSRenderer | undefined>;
}

/**
 * Propagate mouse events to the renderer
 */
export const DSRendererOverlay = memo(function DSRendererOverlay({
  rendererRef,
}: Props) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, cursor: 'text' }}
      onMouseDown={(event) => {
        event.preventDefault();
        rendererRef.current?.mouseDown({
          point: {
            x: event.nativeEvent.offsetX,
            y: event.nativeEvent.offsetY,
          },
        });
      }}
      onMouseMove={(event) => {
        event.preventDefault();
        rendererRef.current?.mouseMove({
          point: {
            x: event.nativeEvent.offsetX,
            y: event.nativeEvent.offsetY,
          },
        });
      }}
      onMouseUp={(event) => {
        event.preventDefault();
        rendererRef.current?.mouseUp({
          point: {
            x: event.nativeEvent.offsetX,
            y: event.nativeEvent.offsetY,
          },
        });
      }}
    />
  );
});
