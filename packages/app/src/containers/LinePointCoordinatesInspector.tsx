import { useApplicationState } from 'noya-app-state-context';
import { Point, Selectors, SetNumberMode } from 'noya-state';
import React, { memo, useCallback } from 'react';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import getMultiNumberValue from '../utils/getMultiNumberValue';

interface Props {
  point: Point | undefined;
  direction: 'start' | 'end';
}

export default memo(function LinePointCoordinatesInspector({
  point,
  direction,
}: Props) {
  const [state, dispatch] = useApplicationState();
  const lineLayer = Selectors.getSelectedLineLayer(state);

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      if (!lineLayer) return;
      const selectedPointList =
        direction === 'start'
          ? {
              [lineLayer.do_objectID]: [0],
            }
          : {
              [lineLayer.do_objectID]: [1],
            };
      dispatch('setPointX', selectedPointList, value, mode);
    },
    [direction, dispatch, lineLayer],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      if (!lineLayer) return;
      const selectedPointList =
        direction === 'start'
          ? {
              [lineLayer.do_objectID]: [0],
            }
          : {
              [lineLayer.do_objectID]: [1],
            };
      dispatch('setPointY', selectedPointList, value, mode);
    },
    [direction, dispatch, lineLayer],
  );

  if (!point) return null;

  const pointX = getMultiNumberValue([point.x]);
  const pointY = getMultiNumberValue([point.y]);

  return (
    <CoordinatesInspector
      x={pointX}
      y={pointY}
      onSetX={handleSetPointX}
      onSetY={handleSetPointY}
    />
  );
});
