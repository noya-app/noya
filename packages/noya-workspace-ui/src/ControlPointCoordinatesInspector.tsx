import React, { memo, useCallback } from 'react';

import { Selectors, SetNumberMode } from 'noya-state';
import { useApplicationState } from 'noya-app-state-context';
import CoordinatesInspector from './CoordinatesInspector';

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

  const decodedCurvePoint =
    Selectors.getCurvePointForSelectedControlPoint(state);

  if (!decodedCurvePoint || !state.selectedControlPoint) return null;

  const { x, y } =
    decodedCurvePoint[state.selectedControlPoint.controlPointType];

  return (
    <CoordinatesInspector
      x={x}
      y={y}
      onSetX={handleSetPointX}
      onSetY={handleSetPointY}
    />
  );
});
