import { Size } from '@noya-app/noya-geometry';
import { useWorkspaceState } from 'noya-app-state-context';
import { generateImage } from 'noya-generate-image';
import { useCanvasKit } from 'noya-renderer';
import React, {
  memo,
  ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTheme } from 'styled-components';

interface Props {
  size: Size;
  renderContent: () => ReactNode;
}

export const CanvasViewer = memo(function CanvasViewer({
  renderContent,
  size,
}: Props) {
  const CanvasKit = useCanvasKit();
  const rawApplicationState = useWorkspaceState();
  const theme = useTheme();
  const [imageData, setImageData] = useState<ImageData | undefined>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const roundedSize = useMemo(
    () => ({ width: Math.ceil(size.width), height: Math.ceil(size.height) }),
    [size.width, size.height],
  );

  useLayoutEffect(() => {
    let valid = true;

    generateImage(
      CanvasKit,
      roundedSize,
      theme,
      rawApplicationState,
      'bytes',
      renderContent,
    ).then((bytes) => {
      if (!valid || !bytes) return;

      setImageData(
        new ImageData(
          new Uint8ClampedArray(bytes.buffer),
          roundedSize.width,
          roundedSize.height,
        ),
      );
    });

    return () => {
      valid = false;
    };
  }, [CanvasKit, theme, rawApplicationState, renderContent, roundedSize]);

  useLayoutEffect(() => {
    if (!imageData) return;

    const context = canvasRef.current?.getContext('2d');

    if (!context) return;

    context.putImageData(imageData, 0, 0);
    // I think we need to re-run if size changes
  }, [roundedSize.height, roundedSize.width, imageData]);

  return (
    <canvas
      ref={canvasRef}
      width={roundedSize.width}
      height={roundedSize.height}
    />
  );
});
