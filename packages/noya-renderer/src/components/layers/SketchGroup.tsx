import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import { Group } from 'noya-react-canvaskit';
import { PageLayer } from 'noya-state';
import { memo, useMemo } from 'react';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.Group | Sketch.Artboard | Sketch.SymbolMaster | Sketch.Page;
}

export default memo(function SketchGroup({ layer }: Props) {
  const transform = useMemo(
    () => AffineTransform.translation(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return useMemo(() => {
    const layers: PageLayer[] = layer.layers;

    return (
      <Group opacity={opacity} transform={transform}>
        {layers.map((child) => (
          <SketchLayer key={child.do_objectID} layer={child} />
        ))}
      </Group>
    );
  }, [layer.layers, opacity, transform]);
});
