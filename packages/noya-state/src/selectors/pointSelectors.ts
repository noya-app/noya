import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState, Layers } from '../index';
import { visit } from '../layers';
import { getCurrentPage } from './pageSelectors';

export const getSelectedPoints = (
  state: ApplicationState,
): Sketch.CurvePoint[] => {
  const page = getCurrentPage(state);
  const pointLists = state.selectedPointLists;

  const points: Sketch.CurvePoint[] = [];

  visit(page, (layer) => {
    if (!Layers.isPointsLayer(layer)) return;

    const pointList = pointLists[layer.do_objectID] ?? [];

    const selectedPoints = layer.points.filter((point, index) =>
      pointList.includes(index),
    );

    points.push(...selectedPoints);
  });

  return points;
};
