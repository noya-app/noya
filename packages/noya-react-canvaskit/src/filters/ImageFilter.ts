import type { CanvasKit, InputColor } from 'canvaskit';
import { Point } from 'noya-geometry';

export type DropShadow = {
  type: 'dropShadow';
  offset: Point;
  radius: number;
  color: InputColor;
};

export function MakeDropShadowOnly(CanvasKit: CanvasKit, shadow: DropShadow) {
  const { offset, radius, color } = shadow;

  return CanvasKit.ImageFilter.MakeDropShadowOnly(
    offset.x,
    offset.y,
    radius,
    radius,
    color,
    null,
  );
}
