import { useApplicationState } from 'noya-app-state-context';
import { Point, SetNumberMode } from 'noya-state';
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
  const [, dispatch] = useApplicationState();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLinePointX', value, direction, mode);
    },
    [direction, dispatch],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLinePointY', value, direction, mode);
    },
    [direction, dispatch],
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
