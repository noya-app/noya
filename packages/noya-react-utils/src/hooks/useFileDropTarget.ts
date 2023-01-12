import { DragEvent, useCallback, useState } from 'react';

export function useFileDropTarget(dropEvent: (event: DragEvent) => void) {
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  const handleDragEvent = useCallback((event: DragEvent, on?: boolean) => {
    if (on !== undefined) setIsDropTargetActive(on);
    event.preventDefault();
  }, []);

  const handleDropEvent = useCallback(
    (event: DragEvent) => {
      dropEvent(event);
      setIsDropTargetActive(false);
    },
    [dropEvent, setIsDropTargetActive],
  );

  return {
    dropTargetProps: {
      onDragOver: handleDragEvent,
      onDragEnter: (event: DragEvent) => handleDragEvent(event, true),
      onDragLeave: (event: DragEvent) => handleDragEvent(event, false),
      onDrop: handleDropEvent,
    },
    isDropTargetActive,
  };
}
