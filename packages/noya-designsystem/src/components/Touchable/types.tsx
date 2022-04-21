import type { Point } from 'noya-geometry';

export interface TouchEvent {
  delta: Point;
  point: Point;
  absolutePoint: Point;
}

export type TouchCallback = (event: TouchEvent) => void;

export interface TouchableProps {
  // Continuous gestures
  onTouchStart?: TouchCallback;
  onTouchUpdate?: TouchCallback;
  onTouchEnd?: TouchCallback;

  // Discrete gestures
  onLongPress?: TouchCallback;
  onPress?: TouchCallback;
}

export type TouchableContextType = TouchableProps[];

export type TouchHandlerName = keyof TouchableProps;
