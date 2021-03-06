import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Group } from 'noya-react-canvaskit';
import { AffineTransform } from 'noya-state/src/utils/AffineTransform';
import { memo, useMemo } from 'react';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.Group;
}

export default memo(function SketchGroup({ layer }: Props) {
  const transform = useMemo(
    () => AffineTransform.translation(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return useMemo(
    () => (
      <Group opacity={opacity} transform={transform}>
        {layer.layers.map((layer) => (
          <SketchLayer key={layer.do_objectID} layer={layer} />
        ))}
      </Group>
    ),
    [layer.layers, opacity, transform],
  );
});
