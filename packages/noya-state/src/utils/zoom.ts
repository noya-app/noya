import { clamp } from '@noya-app/noya-utils';

const ZOOM_LEVELS = [
  0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256,
];

function nearestLevel(zoom: number) {
  return ZOOM_LEVELS.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev,
  );
}

export const Zoom = {
  min: ZOOM_LEVELS[0],
  max: ZOOM_LEVELS[ZOOM_LEVELS.length - 1],
  nearestLevel,
  clamp: (zoom: number) => clamp(zoom, Zoom.min, Zoom.max),
};
