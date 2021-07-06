import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { getRectCornerPoints } from 'noya-geometry';
import { makePath, useReactCanvasKit } from 'noya-react-canvaskit';
import { Group, Image, Primitives } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
import ColorControlsGroup from '../effects/ColorControlsGroup';
import DropShadowGroup from '../effects/DropShadowGroup';
import SketchBorder from '../effects/SketchBorder';

interface Props {
  layer: Sketch.Bitmap;
}

export default memo(function SketchBitmap({ layer }: Props) {
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();

  const ref = state.sketch.images[layer.image._ref];
  const paint = useMemo(() => new CanvasKit.Paint(), [CanvasKit]);

  const path = useMemo(() => {
    const path = makePath(CanvasKit, getRectCornerPoints(layer.frame));

    path.setFillType(CanvasKit.FillType.EvenOdd);

    return path;
  }, [CanvasKit, layer.frame]);

  if (!layer.style) return null;

  const imageElement = (
    <Image
      rect={Primitives.rect(CanvasKit, layer.frame)}
      image={ref}
      paint={paint}
    />
  );

  const borders = (layer.style.borders ?? []).filter((x) => x.isEnabled);
  const shadows = (layer.style.shadows ?? []).filter((x) => x.isEnabled);

  const element = (
    <>
      {shadows.map((shadow, index) => (
        <DropShadowGroup shadow={shadow} key={`shadow-${index}`}>
          {imageElement}
        </DropShadowGroup>
      ))}
      <ColorControlsGroup colorControls={layer.style.colorControls}>
        {imageElement}
      </ColorControlsGroup>
      {borders.map((border, index) => (
        <SketchBorder key={`border-${index}`} path={path} border={border} />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;
  const needsGroup = opacity < 1 || shadows.length > 0;

  return needsGroup ? <Group opacity={opacity}>{element}</Group> : element;
});
