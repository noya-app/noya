import { round } from 'noya-utils';
import { Point } from './types';

export function distance(
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
): number {
  const a = x2 - x1;
  const b = y2 - y1;

  return Math.sqrt(a * a + b * b);
}

export function pointSum(
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
): Point {
  return {
    x: x1 + x2,
    y: y1 + y2,
  };
}

export function roundPoint({ x, y }: Point, precision?: number) {
  return {
    x: round(x, precision),
    y: round(y, precision),
  };
}
