import { SetNumberMode } from 'noya-state';
import { getSelectedControlPoint } from 'noya-state/src/selectors/pointSelectors';
import React, { memo, useCallback } from 'react';
import useCanvasKit from '../hooks/useCanvasKit';
import CoordinatesInspector from '../components/inspector/CoordinatesInspector';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import getMultiNumberValue from '../utils/getMultiNumberValue';

export default memo(function ControlPointCoordinatesInspector() {
  const [state, dispatch] = useApplicationState();
  const CanvasKit = useCanvasKit();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setControlPointX', value, CanvasKit, mode);
    },
    [CanvasKit, dispatch],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setControlPointY', value, CanvasKit, mode);
    },
    [CanvasKit, dispatch],
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

  function roundNumber(number: number, roundTo: number) {
    return parseFloat(number.toFixed(roundTo));
  }

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
