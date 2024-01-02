import { AffineTransform, Point } from '@noya-app/noya-geometry';
import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';

// Event coordinates are relative to (0,0), but we want them to include
// the current page's zoom and offset from the origin
export function convertPoint(
  scrollOrigin: Point,
  zoomValue: number,
  point: Point,
  targetCoordinateSystem:
    | 'screen'
    | 'canvas'
    | { layerId: string; page: Sketch.Page },
): Point {
  const transform = AffineTransform.scale(1 / zoomValue).translate(
    -scrollOrigin.x,
    -scrollOrigin.y,
  );

  switch (targetCoordinateSystem) {
    case 'canvas':
      return transform.applyTo(point);
    case 'screen':
      return transform.invert().applyTo(point);
    default: {
      const indexPath = Layers.findIndexPath(
        targetCoordinateSystem.page,
        (layer) => layer.do_objectID === targetCoordinateSystem.layerId,
      );

      if (!indexPath) return point;

      // Find parent artboard
      const artboard = Layers.accessPath(
        targetCoordinateSystem.page,
        indexPath,
      ).find(Layers.isArtboard);

      if (!artboard) return point;

      return transform
        .append(AffineTransform.translate(-artboard.frame.x, -artboard.frame.y))
        .applyTo(point);
    }
  }
}
