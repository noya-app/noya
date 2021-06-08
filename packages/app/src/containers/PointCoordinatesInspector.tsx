import { SetNumberMode } from 'noya-state';
import { getSelectedPoints } from 'noya-state/src/selectors/pointSelectors';
import React, { memo, useCallback } from 'react';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import getMultiNumberValue from '../utils/getMultiNumberValue';

export default memo(function PointCoordinatesInspector() {
  const [state, dispatch] = useApplicationState();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointX', value, mode);
    },
    [dispatch],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointY', value, mode);
    },
    [dispatch],
  );

  const selectedPoints = getSelectedPoints(state).map(
    (curvePoint) => curvePoint.point,
  );
  const pointX = getMultiNumberValue(selectedPoints.map((point) => point.x));
  const pointY = getMultiNumberValue(selectedPoints.map((point) => point.y));

  return (
    <CoordinatesInspector
      x={pointX}
      y={pointY}
      onSetX={handleSetPointX}
      onSetY={handleSetPointY}
    />
  );
});
