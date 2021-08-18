import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import { Layers, Primitives } from 'noya-state';

export function getCombinedLayerPaths(
  CanvasKit: CanvasKit,
  layer: Sketch.ShapeGroup,
) {
  const paths = layer.layers.filter(Layers.isPointsLayer).map((child) => {
    let path = Primitives.path(
      CanvasKit,
      child.points,
      child.frame,
      child.isClosed,
    );

    return {
      name: child.name, // For debugging
      path,
      op: child.booleanOperation,
    };
  });

  const [first, ...rest] = paths;

  if (!first) return new CanvasKit.Path();

  return rest
    .reduce((result, item) => {
      const op = Primitives.pathOp(CanvasKit, item.op);

      if (op) {
        result.op(item.path, op);
      } else {
        result.addPath(item.path);
      }

      return result;
    }, first.path)
    .transform(AffineTransform.translate(layer.frame.x, layer.frame.y).array);
}
