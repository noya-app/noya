import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  createContext,
  useRef,
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { Touchable, TouchEvent, TouchableContext } from 'noya-designsystem';
import { throttle } from 'noya-utils';
import { Point } from 'noya-geometry';
import { InteractiveProps } from './types';
import { clamp } from '../utils/clamp';

export const InteractiveContext = createContext<{
  width: number;
  height: number;
}>({
  width: 0,
  height: 0,
});

const ClickThreshold = 0.05;

function isInRange(x1: number, x2: number, delta: number) {
  return x1 >= x2 - delta && x1 <= x2 + delta;
}

export const Interactive = memo(function InteractiveBase({
  onClick,
  children,
  locations,
  ...props
}: InteractiveProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onMove = useRef(throttle(props.onMove, 25)).current;

  const handlePress = useCallback(
    (event: TouchEvent) => {
      if (!locations) {
        onMove({
          left: clamp(event.point.x / size.width, 0, 1),
          top: clamp(event.point.y / size.height, 0, 1),
        });
        return;
      }

      let locationIndex: number | undefined = undefined;

      const left = clamp(event.point.x / size.width, 0, 1);
      const top = clamp(event.point.y / size.height, 0, 1);

      for (let i = 0; i <= locations.length; i += 1) {
        const locationX = size.width * locations[i];

        console.log(locationX, 25, event.point.x);

        if (isInRange(event.point.x, locationX, 25)) {
          locationIndex = i;
          break;
        }
      }

      console.log({ locationIndex });

      if (locationIndex !== undefined) {
        console.log('onClick', locationIndex);
        onClick?.(locationIndex);
        return;
      }

      onClick?.({ left, top });
    },
    [locations, onClick, size.width, size.height, onMove],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (locations) {
        handlePress(event);
        return;
      }

      onMove({
        left: clamp(event.point.x / size.width, 0, 1),
        top: clamp(event.point.y / size.height, 0, 1),
      });
    },
    [locations, size.width, size.height, handlePress, onMove],
  );

  const handleTouchUpdate = useCallback(
    ({ point }: TouchEvent) => {
      onMove({
        left: clamp(point.x / size.width, 0, 1),
        top: clamp(point.y / size.height, 0, 1),
      });
    },
    [onMove, size.width, size.height],
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

  const value = useMemo(() => size, [size]);

  return (
    <InteractiveContext.Provider value={value}>
      {/* Block all parent touchable component from revicing interactive events */}
      <TouchableContext.Provider value={[]}>
        <Touchable
          onPress={handlePress}
          onTouchStart={handleTouchStart}
          onTouchUpdate={handleTouchUpdate}
        >
          <View onLayout={onLayout}>{children}</View>
        </Touchable>
      </TouchableContext.Provider>
    </InteractiveContext.Provider>
  );
});
