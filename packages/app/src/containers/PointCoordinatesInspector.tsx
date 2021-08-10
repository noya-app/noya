import { getMultiNumberValue, Selectors, SetNumberMode } from 'noya-state';
import React, { memo, useCallback } from 'react';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import { useApplicationState } from 'noya-app-state-context';

export default memo(function PointCoordinatesInspector() {
  const [state, dispatch] = useApplicationState();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointX', state.selectedPointLists, value, mode);
    },
    [dispatch, state.selectedPointLists],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointY', state.selectedPointLists, value, mode);
    },
    [dispatch, state.selectedPointLists],
  );

  const selectedPoints = Selectors.getSelectedPoints(state).map(
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
