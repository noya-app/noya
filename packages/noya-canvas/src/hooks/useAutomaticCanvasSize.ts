import { Insets, Size } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { useLayoutEffect, useMemo } from 'react';
import { useTheme } from 'styled-components';

type CanvasSizes = {
  // The viewport size is the size of the container element that the user can interact with
  viewportSize?: Size;

  // The canvas size is the size that actually gets rendered, so it includes the insets
  canvasSize?: Size;

  // The insets are the space obscured by the sidebar and toolbar
  canvasInsets: Insets;
};

export function useAutomaticCanvasSize({
  containerRef,
  onChangeSize,
}: {
  containerRef: React.RefObject<HTMLElement>;
  onChangeSize: (size: Size, insets: Insets) => void;
}): CanvasSizes {
  const theme = useTheme();
  const containerSize = useSize(containerRef);

  const {
    sizes: {
      sidebarWidth,
      toolbar: { height: toolbarHeight },
    },
  } = theme;

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
      top: toolbarHeight,
      bottom: 0,
    }),
    [sidebarWidth, toolbarHeight],
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
    canvasInsets: insets,
  };
}
