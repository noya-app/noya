import { useCallback, useRef } from 'react';
import { GestureResponderEvent } from 'react-native';

import { Point } from 'noya-geometry';

export enum GestureType {
  Pan = 'Pan',
  Pinch = 'Pinch',
}

export interface GesturePoint {
  id: string;
  x: number;
  y: number;
}

export interface Gesture {
  type: GestureType;
}

export interface PanGesture extends Gesture {
  type: GestureType.Pan;
  deltaX: number;
  deltaY: number;
  x: number;
  y: number;
}

export interface PinchGesture extends Gesture {
  type: GestureType.Pinch;
  scale: number;
  x: number;
  y: number;
}

export interface TouchMeta {
  points: GesturePoint[];
  avgDistance: number;
  centroid: Point;
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
}

export function getGestureMeta(event: GestureResponderEvent): TouchMeta {
  const centroid: Point = { x: 0, y: 0 };
  let avgDistance = 0;

  const points: GesturePoint[] = event.nativeEvent.touches.map((touch) => ({
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

  points.forEach(({ x, y }) => {
    avgDistance += getDistance(x, y, centroid.x, centroid.y);
  });

  avgDistance /= points.length;

  return { points, centroid, avgDistance };
}

const DistanceTreshhold = 3;

const initTouch = {
  points: [],
  centroid: { x: 0, y: 0 },
  avgDistance: 0,
};

// provides tools for multi-touch/multi-point gesture detection
export default function useMultitouchGH() {
  const lastTouchMeta = useRef<TouchMeta>(initTouch);

  const setTouches = useCallback((event: GestureResponderEvent) => {
    lastTouchMeta.current = getGestureMeta(event);
  }, []);

  const getGesture = useCallback((event: GestureResponderEvent): Gesture => {
    const touchMeta = getGestureMeta(event);
    let gesture: Gesture;

    if (
      Math.abs(touchMeta.avgDistance - lastTouchMeta.current.avgDistance) <
      DistanceTreshhold
    ) {
      gesture = {
        type: GestureType.Pan,
        x: touchMeta.centroid.x,
        y: touchMeta.centroid.y,
        deltaX: lastTouchMeta.current.centroid.x - touchMeta.centroid.x,
        deltaY: lastTouchMeta.current.centroid.y - touchMeta.centroid.y,
      } as PanGesture;
    } else {
      gesture = {
        type: GestureType.Pinch,
        x: touchMeta.centroid.x,
        y: touchMeta.centroid.y,
        scale: touchMeta.avgDistance / lastTouchMeta.current.avgDistance,
      } as PinchGesture;
    }

    lastTouchMeta.current = touchMeta;
    return gesture;
  }, []);

  const resetTouches = useCallback(() => {
    lastTouchMeta.current = initTouch;
  }, []);

  return {
    setTouches,
    getGesture,
    resetTouches,
  };
}
