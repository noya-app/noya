import type { TouchData } from 'react-native-gesture-handler';

import { Point } from 'noya-geometry';

export enum GestureState {
  Undetermined = 'Undetermined',
  Canvas = 'Canvas',
  Other = 'Other',
}

export interface TouchMap {
  [id: number]: TouchData;
}

export interface TouchHistory {
  touches: TouchMap;
  numberOfTouches: number;

  // Center of the touches, used both in pan and pinch gestures
  centroid: Point;
  // If one of the touches has stable position
  // it will be usedd as origin of scale instead of centroid
  stableTouchId?: number;
  // Used in case of change in touches amount to avoid
  // Jumping when finger is placed or lifted from the screen
  panTouchId?: number;
  // Touches that were used to determine scale of the pinch
  pinchIds: [number, number];
}

export interface Features {
  distance: number;
  scale: number;
  delta: Point;
  scaleTo: Point;
  point: Point;
}

export interface CallbackParams {
  state: GestureState;
  scale: number;
  delta: Point;
  scaleTo: Point;
  point: Point;
  touches: TouchData[];
}

export const MoveThreshold = 2;

export function getTouchMap(touches: TouchData[]) {
  'worklet';
  const map: TouchMap = {};

  touches.forEach((touch) => {
    map[touch.id] = {
      ...touch,
    };
  });

  return map;
}

function getDistance(p1: Point, p2: Point): number {
  'worklet';

  return Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
}

function getPinch(
  inTouches: TouchData[],
  touches: TouchMap,
  history: TouchHistory,
): { scale: number; pinchIds: [number, number] } {
  'worklet';
  if (inTouches.length < 2) {
    return { scale: 1, pinchIds: [inTouches[0].id, inTouches[0].id] };
  }

  const [lp1, lp2] = history.pinchIds;

  if (lp1 === lp2) {
    const [touch1, touch2] = inTouches;
    return { scale: 1, pinchIds: [touch1.id, touch2.id] };
  }
  const hasSameTouch = touches[lp1] && touches[lp2];
  const lastDistance = getDistance(history.touches[lp1], history.touches[lp2]);
  let currentDistance: number = lastDistance;

  if (hasSameTouch) {
    currentDistance = getDistance(touches[lp1], touches[lp2]);
  } else {
    currentDistance = getDistance(touches[0], touches[1]);
  }

  let scale = lastDistance === 0 ? 1 : currentDistance / lastDistance;
  return { scale, pinchIds: history.pinchIds };
}

function getReferencePoints(inTouches: TouchData[], history: TouchHistory) {
  'worklet';
  let centroid: Point = { x: 0, y: 0 };
  let stablePoints: TouchData[] = [];

  inTouches.forEach((touch) => {
    centroid.x += touch.x;
    centroid.y += touch.y;

    if (history.touches[touch.id]) {
      const distance = getDistance(touch, history.touches[touch.id]);

      if (distance < MoveThreshold) {
        stablePoints.push(touch);
      }
    }
  });

  centroid.x /= inTouches.length;
  centroid.y /= inTouches.length;

  return {
    centroid,
    stablePoint: stablePoints.length ? stablePoints[0] : undefined,
  };
}

export function getInitialHistory(inTouches: TouchData[]): TouchHistory {
  'worklet';
  const centroid = { x: 0, y: 0 };

  inTouches.forEach((touch) => {
    centroid.x += touch.x;
    centroid.y += touch.y;
  });

  centroid.x /= inTouches.length;
  centroid.y /= inTouches.length;

  if (inTouches.length > 1) {
    const [touch1, touch2] = inTouches;
    return {
      numberOfTouches: inTouches.length,
      touches: getTouchMap(inTouches),
      pinchIds: [touch1.id, touch2.id],
      panTouchId: touch1.id,
      centroid,
    };
  }

  const [firstTouch] = inTouches;

  return {
    numberOfTouches: inTouches.length,
    touches: getTouchMap(inTouches),
    pinchIds: [firstTouch.id, firstTouch.id],
    panTouchId: firstTouch.id,
    centroid,
  };
}

export function getFeatures(
  inTouches: TouchData[],
  history: TouchHistory,
): [Features, TouchHistory] {
  'worklet';
  const touches = getTouchMap(inTouches);
  const { centroid, stablePoint } = getReferencePoints(inTouches, history);
  const { scale, pinchIds } = getPinch(inTouches, touches, history);
  const centroidDistance = getDistance(history.centroid, centroid);
  const stablePointDistance = stablePoint
    ? getDistance(stablePoint, history.touches[stablePoint.id])
    : Infinity;

  let delta = { x: 0, y: 0 };
  let panTouchId: number | undefined;
  let distance: number = 0;
  const sharedTouch = inTouches.find((touch) => !!history.touches[touch.id]);

  if (sharedTouch) {
    delta.x = history.touches[sharedTouch.id].x - sharedTouch.x;
    delta.y = history.touches[sharedTouch.id].y - sharedTouch.y;
    distance = getDistance(history.touches[sharedTouch.id], sharedTouch);
  } else {
    delta.x = history.centroid.x - centroid.x;
    delta.y = history.centroid.y - centroid.y;
    distance = getDistance(history.centroid, centroid);
  }

  return [
    {
      point: sharedTouch ?? centroid,
      scale,
      scaleTo: centroidDistance < stablePointDistance ? centroid : stablePoint!,
      distance,
      delta,
    },
    {
      touches,
      numberOfTouches: inTouches.length,
      centroid,
      pinchIds,
      panTouchId,
    },
  ];
}
