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

  pinchLastIds: [number, number];
  panLastId: number;
}

export interface Features {
  distance: number;
  scale: number;
  delta: Point;
  center: Point;
  x: number;
  y: number;
}

export interface CallbackParams {
  state: GestureState;
  scale: number;
  delta: Point;
  center: Point;
  x: number;
  y: number;
}

function getDistance(p1: Point, p2: Point): number {
  'worklet';

  return Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
}

function getPan(touches: TouchMap, history: TouchHistory): [number, number] {
  'worklet';
  const hasSameTouch = !!touches[history.panLastId];

  if (hasSameTouch) {
    const distance = getDistance(
      touches[history.panLastId],
      history.touches[history.panLastId],
    );

    return [distance, history.panLastId];
  }

  const newId = Object.values(touches).find(
    ({ id }) => !!history.touches[id],
  ).id;

  const distance = getDistance(touches[newId], history.touches[newId]);

  return [distance, newId];
}

function getPinch(
  touches: TouchMap,
  history: TouchHistory,
  numberOfTouches: number,
): [number, [number, number]] {
  'worklet';
  if (numberOfTouches < 2) {
    return [1, [0, 0]];
  }

  const [lp1, lp2] = history.pinchLastIds;
  const hasSameTouch = touches[lp1] && touches[lp2];
  const lastDistance = getDistance(history.touches[lp1], history.touches[lp2]);
  let currentDistance: number = lastDistance;

  if (hasSameTouch) {
    currentDistance = getDistance(touches[lp1], touches[lp2]);
  } else {
    currentDistance = getDistance(touches[0], touches[1]);
  }

  let scale = currentDistance / lastDistance;

  return [scale, history.pinchLastIds];
}

export function getTouchMap(touches: TouchData[]) {
  'worklet';
  const map: TouchMap = {};

  touches.forEach((touch) => {
    map[touch.id] = touch;
  });

  return map;
}

export function getFeatures(
  inTouches: TouchData[],
  history: TouchHistory,
): [Features, TouchHistory] {
  'worklet';
  const touches = getTouchMap(inTouches);

  const [distance, panId] = getPan(touches, history);
  const [scale, pinchIds] = getPinch(touches, history, inTouches.length);
  const { x, y } = touches[panId];
  const center = { x: 0, y: 0 };

  inTouches.forEach((touch) => {
    center.x += touch.x;
    center.y += touch.y;
  });

  center.x /= inTouches.length;
  center.y /= inTouches.length;

  return [
    {
      distance,
      scale,
      delta: {
        x: history.touches[panId].x - touches[panId].x,
        y: history.touches[panId].y - touches[panId].y,
      },
      center,
      x,
      y,
    },
    {
      touches,
      numberOfTouches: inTouches.length,
      panLastId: panId,
      pinchLastIds: pinchIds,
    },
  ];
}
