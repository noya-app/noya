import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Group, Image, useReactCanvasKit } from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';
import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';

interface Props {
  layer: Sketch.Bitmap;
}

export default memo(function SketchBitmap({ layer }: Props) {
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();

  const ref = state.sketch.images[layer.image._ref];
  const paint = useMemo(() => new CanvasKit.Paint(), [CanvasKit]);

  const element = (
    <Image
      rect={Primitives.rect(CanvasKit, layer.frame)}
      image={ref}
      paint={paint}
    />
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{element}</Group> : element;
});
