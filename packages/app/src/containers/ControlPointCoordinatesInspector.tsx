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
      dispatch(
        'setControlPointX',
        value,
        state.selectedControlPoint?.controlPointType,
        CanvasKit,
        mode,
      );
    },
    [CanvasKit, dispatch, state.selectedControlPoint?.controlPointType],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch(
        'setControlPointY',
        value,
        state.selectedControlPoint?.controlPointType,
        CanvasKit,
        mode,
      );
    },
    [CanvasKit, dispatch, state.selectedControlPoint?.controlPointType],
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
