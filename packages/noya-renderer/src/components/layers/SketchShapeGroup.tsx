import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import { memo, useMemo } from 'react';
import { Group } from '../..';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.ShapeGroup;
}

export default memo(function SketchShapeGroup({ layer }: Props) {
  const transform = useMemo(
    () => AffineTransform.translation(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  // TODO: Join with path ops
  const elements = layer.layers.map((child) => (
    <SketchLayer
      key={child.do_objectID}
      layer={{ ...child, style: layer.style }}
    />
  ));

  return (
    <Group opacity={opacity} transform={transform}>
      {elements}
    </Group>
  );
});
