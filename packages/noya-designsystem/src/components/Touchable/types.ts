import { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';

import { Point } from 'noya-geometry';

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
}

export interface Gesture {
  type: GestureType;
  point: Point;
  delta?: Point;
  scale?: number;
}

export type TouchCallback = (props: Gesture) => void;

export type TouchableProps = PropsWithChildren<{
  onPress?: TouchCallback;
  onLongPress?: TouchCallback;
  onTouchStart?: TouchCallback;
  onTouchUpdate?: TouchCallback;
  onTouchEnd?: TouchCallback;
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
}
