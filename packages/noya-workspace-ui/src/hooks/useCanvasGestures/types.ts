import type { TouchData } from 'react-native-gesture-handler';

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
  touches: TouchData[];
}

export type CanvasTouchCallback = (params: CanvasTouchEvent) => void;
