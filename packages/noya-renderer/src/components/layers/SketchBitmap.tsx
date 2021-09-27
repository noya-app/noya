import Sketch from 'noya-file-format';
import { getRectCornerPoints } from 'noya-geometry';
import { Primitives } from 'noya-state';
import { makePath } from 'noya-react-canvaskit';
import { Group, Image, useCanvasKit, useZoom } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
import { useSketchImage } from '../../ImageCache';
import ColorControlsGroup from '../effects/ColorControlsGroup';
import DropShadowGroup from '../effects/DropShadowGroup';
import SketchBorder from '../effects/SketchBorder';
import BlurGroup from '../effects/BlurGroup';
import { SketchModel } from 'noya-sketch-model';
import { SHOW_PIXELS_ZOOM_THRESHOLD } from '../PixelGrid';

interface Props {
  layer: Sketch.Bitmap;
}

export default memo(function SketchBitmap({ layer }: Props) {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const image = useSketchImage(layer.image);

  const paint = useMemo(() => new CanvasKit.Paint(), [CanvasKit]);

  const path = useMemo(() => {
    const path = makePath(CanvasKit, getRectCornerPoints(layer.frame));

    path.setFillType(CanvasKit.FillType.EvenOdd);

    return path;
  }, [CanvasKit, layer.frame]);

  const blur = useMemo(
    () => layer.style?.blur ?? SketchModel.blur({ isEnabled: false }),
    [layer.style?.blur],
  );

  if (!layer.style || !image) return null;

  const imageElement = (
    <Image
      rect={Primitives.rect(CanvasKit, layer.frame)}
      image={image}
      paint={paint}
      resample={zoom < SHOW_PIXELS_ZOOM_THRESHOLD} // TODO: Make this configurable
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
        <SketchBorder
          key={`border-${index}`}
          path={path}
          border={border}
          frame={layer.frame}
        />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const needsGroup = opacity < 1 || shadows.length > 0;

  return (
    <BlurGroup blur={blur}>
      {needsGroup ? <Group opacity={opacity}>{element}</Group> : element}
    </BlurGroup>
  );
});
