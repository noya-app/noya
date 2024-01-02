import { Sketch } from '@noya-app/noya-file-format';
import { CanvasKit } from 'canvaskit';
import { Layers, Primitives } from 'noya-state';

export function getCombinedLayerPaths(
  CanvasKit: CanvasKit,
  layer: Sketch.ShapeGroup,
) {
  const layers = layer.layers
    .filter(Layers.isPointsLayer)
    .filter((layer) => layer.isVisible)
    .map((child) => {
      const path = Primitives.path(
        CanvasKit,
        child.points,
        child.frame,
        child.isClosed,
      );

      return {
        path,
        op: child.booleanOperation,
      };
    });

  const [first, ...rest] = layers;

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
    .offset(layer.frame.x, layer.frame.y);
}
