import { SetNumberMode } from 'noya-state';
import { getSelectedControlPoint } from 'noya-state/src/selectors/pointSelectors';
import React, { memo, useCallback } from 'react';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import getMultiNumberValue from '../utils/getMultiNumberValue';

// TODO:  if the type of the point is Mirrored or Asymmetric,
// then updating one control point also updates the opposite control point.
// We should handle this both when changing coordinates and point type.

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

  const pointX = getMultiNumberValue([
    selectedControlPoint[state.selectedControlPoint.controlPointType].x,
  ]);
  const pointY = getMultiNumberValue([
    selectedControlPoint[state.selectedControlPoint.controlPointType].y,
  ]);

  return (
    <CoordinatesInspector
      x={pointX}
      y={pointY}
      onSetX={handleSetPointX}
      onSetY={handleSetPointY}
    />
  );
});
