import { PropsWithChildren } from 'react';
import { ViewProps, NativeTouchEvent } from 'react-native';

import { Point } from 'noya-geometry';

export type SimplifiedGestureEvent = { nativeEvent: NativeTouchEvent };

export enum GestureType {
  None = 'None',
  Pan = 'Pan',
  Pinch = 'Pinch',
  Press = 'Press',
  LongPress = 'LongPress',
}

export interface TouchPoint {
  id: string;
  x: number;
  y: number;
}

export interface TouchMeta {
  points: TouchPoint[];
  avgDistance: number;
  centroid: Point;
  numOfPointers: number;
  absolutePoint: Point;
}

export interface Gesture {
  type: GestureType;
  point: Point;
  absolutePoint: Point;
  delta?: Point;
  scale?: number;
  numOfPointers: number;
}

export type TouchCallback = (props: Gesture) => void;

export type TouchableProps = PropsWithChildren<{
  onPress?: TouchCallback;
  onLongPress?: TouchCallback;
  onTouchStart?: TouchCallback;
  onTouchUpdate?: TouchCallback;
  onTouchEnd?: TouchCallback;
  onTouchCancel?: () => void;
}>;

export type TouchableComponentProps = TouchableProps &
  Omit<
    ViewProps,
    'onTouchStart' | 'onTouchUpdate' | 'onTouchEnd' | 'onPress' | 'onLongPress'
  >;

export interface TouchableContextType {
  onPress: TouchCallback[];
  onLongPress: TouchCallback[];
  onTouchStart: TouchCallback[];
  onTouchUpdate: TouchCallback[];
  onTouchEnd: TouchCallback[];
  onTouchCancel: (() => void)[];
}
