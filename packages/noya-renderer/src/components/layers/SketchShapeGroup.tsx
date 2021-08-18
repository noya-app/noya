import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import { Group, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Primitives } from 'noya-state';
import { memo, useMemo } from 'react';
import SketchShape from './SketchShape';

interface Props {
  layer: Sketch.ShapeGroup;
}

export default memo(function SketchShapeGroup({ layer }: Props) {
  const CanvasKit = useCanvasKit();

  const transform = useMemo(
    () => AffineTransform.translate(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const paths = layer.layers.filter(Layers.isPointsLayer).map((child) => {
    let path = Primitives.path(
      CanvasKit,
      child.points,
      child.frame,
      child.isClosed,
    );

    return {
      name: child.name,
      path,
      op: child.booleanOperation,
    };
  });

  const [first, ...rest] = paths;

  if (!first) return null;

  const path = rest.reduce((result, item) => {
    const op = Primitives.pathOp(CanvasKit, item.op);

    if (op) {
      result.op(item.path, op);
    } else {
      result.addPath(item.path);
    }

    return result;
  }, first.path);

  const newLayer = SketchModel.shapePath({
    ...layer,
  });

  return (
    <Group opacity={opacity} transform={transform}>
      <SketchShape layer={newLayer} path={path} />
    </Group>
  );
});
