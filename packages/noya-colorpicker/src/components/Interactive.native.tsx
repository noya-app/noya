import React, { memo, useState, useCallback, createContext } from 'react';
import { LayoutChangeEvent } from 'react-native';

import { Touchable, Gesture } from 'noya-designsystem';
import { clamp } from '../utils/clamp';
import { InteractiveProps } from './types';

export const InteractiveContext = createContext<{
  width: number;
  height: number;
}>({
  width: 0,
  height: 0,
});

const ClickThreshold = 0.03;

export const Interactive = memo(function InteractiveBase({
  onMove,
  onClick,
  children,
  locations,
}: InteractiveProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleMove = useCallback(
    (params: Gesture) => {
      onMove({
        left: clamp(params.point.x / size.width, 0, 1),
        top: clamp(params.point.y / size.height, 0, 1),
      });
    },
    [onMove, size],
  );

  const onTouchStart = useCallback(
    (params: Gesture) => {
      if (!locations) {
        handleMove(params);
        return;
      }

      let locationIndex: number | undefined = undefined;
      const left = clamp(params.point.x / size.width, 0, 1);
      const top = clamp(params.point.y / size.height, 0, 1);

      locations.forEach((location, index) => {
        if (Math.abs(left - location) < 20 / size.width + ClickThreshold) {
          locationIndex = index;
        }
      });

      if (locationIndex !== undefined) {
        onClick?.(locationIndex);
        return;
      }

      onClick?.({ left, top });
    },
    [handleMove, locations, size, onClick],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const {
        layout: { width, height },
      } = event.nativeEvent;

      if (
        !!width &&
        !!height &&
        (width !== size.width || height !== size.height)
      ) {
        setSize({ width, height });
      }
    },
    [setSize, size],
  );

  return (
    <InteractiveContext.Provider value={size}>
      <Touchable
        onTouchStart={onTouchStart}
        onTouchUpdate={handleMove}
        onTouchEnd={handleMove}
        onLayout={onLayout}
      >
        {children}
      </Touchable>
    </InteractiveContext.Provider>
  );
});
