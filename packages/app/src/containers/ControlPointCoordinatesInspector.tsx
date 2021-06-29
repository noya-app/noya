import { SetNumberMode } from 'noya-state';
import { getSelectedControlPoint } from 'noya-state/src/selectors/pointSelectors';
import React, { memo, useCallback } from 'react';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import { useApplicationState } from '../contexts/ApplicationStateContext';

function roundNumber(number: number, roundTo: number) {
  return parseFloat(number.toFixed(roundTo));
}

export default memo(function ControlPointCoordinatesInspector() {
  const [state, dispatch] = useApplicationState();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setControlPointX', value, mode);
    },
    [dispatch],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setControlPointY', value, mode);
    },
    [dispatch],
  );

  const selectedControlPoint = getSelectedControlPoint(state);
  if (!selectedControlPoint || !state.selectedControlPoint) {
    return;
  }

  const pointX =
    selectedControlPoint[state.selectedControlPoint.controlPointType].x;
  const pointY =
    selectedControlPoint[state.selectedControlPoint.controlPointType].y;

  const roundedPointX = pointX ? roundNumber(pointX, 2) : undefined;
  const roundedPointY = pointY ? roundNumber(pointY, 2) : undefined;

  return (
    <CoordinatesInspector
      x={roundedPointX}
      y={roundedPointY}
      onSetX={handleSetPointX}
      onSetY={handleSetPointY}
    />
  );
});
