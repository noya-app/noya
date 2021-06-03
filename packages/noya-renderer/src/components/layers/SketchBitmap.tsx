import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { getRectCornerPoints } from 'noya-geometry';
import {
  Group,
  Image,
  makePath,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';
import SketchBorder from '../effects/SketchBorder';

interface Props {
  layer: Sketch.Bitmap;
}

export default memo(function SketchBitmap({ layer }: Props) {
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();

  const ref = state.sketch.images[layer.image._ref];
  const paint = useMemo(() => new CanvasKit.Paint(), [CanvasKit]);

  const path = makePath(CanvasKit, getRectCornerPoints(layer.frame));

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return null;

  const borders = (layer.style.borders ?? []).filter((x) => x.isEnabled);

  const element = (
    <>
      <Image
        rect={Primitives.rect(CanvasKit, layer.frame)}
        image={ref}
        paint={paint}
      />
      {borders.map((border, index) => (
        <SketchBorder key={`border-${index}`} path={path} border={border} />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;
  const needsGroup = opacity < 1;

  return needsGroup ? <Group opacity={opacity}>{element}</Group> : element;
});
