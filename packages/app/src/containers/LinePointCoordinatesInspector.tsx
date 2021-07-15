import { useDispatch } from 'noya-app-state-context';
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
  const dispatch = useDispatch();

  const handleSetPointX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointX', value, mode, direction);
    },
    [direction, dispatch],
  );

  const handleSetPointY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setPointY', value, mode, direction);
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
