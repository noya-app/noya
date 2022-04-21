import type { Point } from 'noya-geometry';

export enum GestureState {
  Undetermined = 'Undetermined',
  Canvas = 'Canvas',
  Other = 'Other',
}

export interface CanvasTouchEvent {
  state: GestureState;
  scale: number;
  delta: Point;
  scaleTo: Point;
  point: Point;
}

export type CanvasTouchCallback = (params: CanvasTouchEvent) => void;
