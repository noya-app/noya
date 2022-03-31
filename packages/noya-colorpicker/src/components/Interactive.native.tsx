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

export const Interactive = memo(function InteractiveBase({
  onMove,
  children,
}: InteractiveProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onTouch = useCallback(
    (params: Gesture) => {
      onMove({
        left: clamp(params.point.x / size.width, 0, 1),
        top: clamp(params.point.y / size.height, 0, 1),
      });
    },
    [onMove, size],
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
        onTouchStart={onTouch}
        onTouchUpdate={onTouch}
        onTouchEnd={onTouch}
        onLayout={onLayout}
      >
        {children}
      </Touchable>
    </InteractiveContext.Provider>
  );
});
