import { Insets, Size } from '@noya-app/noya-geometry';
import { useSize } from 'noya-react-utils';
import { useLayoutEffect, useMemo } from 'react';

type CanvasSizes = {
  // The viewport size is the size of the container element that the user can interact with
  viewportSize?: Size;

  // The canvas size is the size that actually gets rendered, so it includes the insets
  canvasSize?: Size;
};

export function useAutomaticCanvasSize({
  insets,
  containerRef,
  onChangeSize,
}: {
  insets: Insets;
  containerRef: React.RefObject<HTMLElement>;
  onChangeSize: (size: Size, insets: Insets) => void;
}): CanvasSizes {
  const rawContainerSize = useSize(containerRef);

  const containerSize = useMemo(
    () =>
      rawContainerSize
        ? {
            width: Math.max(rawContainerSize.width),
            height: Math.max(rawContainerSize.height),
          }
        : undefined,
    [rawContainerSize],
  );

  // Update the canvas size whenever the window is resized
  useLayoutEffect(() => {
    if (!containerSize) return;

    onChangeSize(containerSize, insets);
  }, [insets, onChangeSize, containerSize]);

  const canvasSize = useMemo(
    () =>
      containerSize && containerSize.width > 0 && containerSize.height > 0
        ? {
            width: containerSize.width + insets.left + insets.right,
            height: containerSize.height + insets.top + insets.bottom,
          }
        : undefined,
    [containerSize, insets.bottom, insets.left, insets.right, insets.top],
  );

  return {
    viewportSize: containerSize,
    canvasSize: canvasSize,
  };
}
