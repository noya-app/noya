import React, {
  memo,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTheme } from 'styled-components';
import { useWorkspaceState } from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { renderImageFromCanvas } from '../utils/renderImageFromCanvas';

interface Props {
  width: number;
  height: number;
  renderContent: () => ReactNode;
}

export default memo(function CanvasViewer({
  width,
  height,
  renderContent,
}: Props) {
  const CanvasKit = useCanvasKit();
  const rawApplicationState = useWorkspaceState();
  const theme = useTheme();
  const [imageData, setImageData] = useState<ImageData | undefined>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    let valid = true;

    renderImageFromCanvas(
      CanvasKit,
      width,
      height,
      theme,
      rawApplicationState,
      'bytes',
      renderContent,
    ).then((bytes) => {
      if (!valid || !bytes) return;

      setImageData(
        new ImageData(new Uint8ClampedArray(bytes.buffer), width, height),
      );
    });

    return () => {
      valid = false;
    };
  }, [CanvasKit, width, height, theme, rawApplicationState, renderContent]);

  useLayoutEffect(() => {
    if (!imageData) return;

    const context = canvasRef.current?.getContext('2d');

    if (!context) return;

    context.putImageData(imageData, 0, 0);
  }, [height, imageData, width]);

  return <canvas ref={canvasRef} width={width} height={height} />;
});
