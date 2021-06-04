import memoize from 'noya-state/src/utils/memoize';
import { CanvasKit, Paint, Image } from 'canvaskit';
import { createElement, memo, useMemo } from 'react';
import usePaint, { PaintParameters } from '../hooks/usePaint';
import useRect, { RectParameters } from '../hooks/useRect';
import { ImageComponentProps } from '../types';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';

const decodeImage = memoize(
  (
    CanvasKit: CanvasKit,
    data: ArrayBuffer,
  ): ReturnType<CanvasKit['MakeImageFromEncoded']> => {
    return CanvasKit.MakeImageFromEncoded(data);
  },
);

interface ImageProps {
  image: Image | ArrayBuffer;
  rect: RectParameters;
  paint: Paint | PaintParameters;
}

export default memo(function Image(props: ImageProps) {
  const { CanvasKit } = useReactCanvasKit();

  const rect = useRect(props.rect);
  const paint = usePaint(props.paint);
  const image = useMemo(
    () =>
      props.image instanceof ArrayBuffer
        ? decodeImage(CanvasKit, props.image)
        : props.image,
    [CanvasKit, props.image],
  );

  const elementProps: ImageComponentProps | undefined = useMemo(
    () =>
      image
        ? {
            rect,
            paint,
            image,
          }
        : undefined,
    [rect, paint, image],
  );

  if (!elementProps) return null;

  return createElement('Image', elementProps);
});
