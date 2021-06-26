import { useCallback, useState, DragEvent } from 'react';

export function useFileDropTarget(dropEvent: (e: DragEvent) => void) {
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  const handleDragEvent = useCallback((e: DragEvent, on?: boolean) => {
    if (on !== undefined) setIsDropTargetActive(on);
    e.preventDefault();
  }, []);

  const handleDropEvent = useCallback(
    (e: DragEvent) => {
      dropEvent(e);
      setIsDropTargetActive(false);
    },
    [dropEvent, setIsDropTargetActive],
  );

  return {
    dropTargetProps: {
      onDragOver: handleDragEvent,
      onDragEnter: (e: DragEvent) => handleDragEvent(e, true),
      onDragLeave: (e: DragEvent) => handleDragEvent(e, false),
      onDrop: handleDropEvent,
    },
    isDropTargetActive,
  };
}
