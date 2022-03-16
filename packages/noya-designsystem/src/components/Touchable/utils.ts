import { GestureResponderEvent } from 'react-native';

import { Point } from 'noya-geometry';
import type {
  TouchMeta,
  TouchPoint,
  TouchCallback,
  TouchableContextType,
} from './types';

// Time to consider single press a long press
export const LongPressThresholdMS = 370;
// delta distance of average distance to gesture centroid
// to consider it a pinch gesture
export const PinchThreshold = 5;
// delta distance of gesture centroid between calls
// to consider it a pan gesture
export const PanThreshold = 5;

export const initMeta = {
  points: [],
  avgDistance: 0,
  centroid: { x: 0, y: 0 },
};

export const initialHandlers: TouchableContextType = {
  onPress: [],
  onLongPress: [],
  onTouchStart: [],
  onTouchUpdate: [],
  onTouchEnd: [],
};

export const touchableEventNames = [
  'onPress',
  'onLongPress',
  'onTouchStart',
  'onTouchUpdate',
  'onTouchEnd',
];

export function mergeHandlers(
  parentHandlers: TouchCallback[],
  currentHandler?: TouchCallback,
): TouchCallback[] {
  const handlers: TouchCallback[] = [...parentHandlers];

  if (currentHandler) {
    handlers.push(currentHandler);
  }

  return handlers;
}

export function getPoint({ nativeEvent }: GestureResponderEvent) {
  if (nativeEvent.touches.length > 1) {
    const firstTouch = nativeEvent.touches[0];

    return {
      x: firstTouch.locationX,
      y: firstTouch.locationY,
    };
  }

  return {
    x: Math.round(nativeEvent.locationX),
    y: Math.round(nativeEvent.locationY),
  };
}

export function getDistance(p1: Point, p2: Point) {
  return Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
}

export function getTouchMeta({
  nativeEvent,
}: GestureResponderEvent): TouchMeta {
  const centroid: Point = { x: 0, y: 0 };
  let avgDistance = 0;

  const points: TouchPoint[] = nativeEvent.touches.map((touch) => ({
    x: Math.round(touch.locationX),
    y: Math.round(touch.locationY),
    id: touch.identifier,
  }));

  points.forEach((point) => {
    centroid.x += point.x;
    centroid.y += point.y;
  });

  centroid.x /= points.length;
  centroid.y /= points.length;

  points.forEach((point) => {
    avgDistance += getDistance(point, centroid);
  });

  avgDistance /= points.length;

  if (!points.length) {
    return {
      points: [],
      centroid: { x: nativeEvent.locationX, y: nativeEvent.locationY },
      avgDistance: 0,
    };
  }

  return { points, centroid, avgDistance };
}
