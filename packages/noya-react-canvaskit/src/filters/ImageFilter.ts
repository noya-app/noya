import { Point } from '@noya-app/noya-geometry';
import type { CanvasKit, InputColor } from '@noya-app/noya-canvaskit';

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
