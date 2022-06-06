import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  createContext,
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { Touchable, TouchEvent, TouchableContext } from 'noya-designsystem';
import { useThrottledFunction } from 'noya-react-utils';
import { clamp } from '../utils/clamp';
import { InteractiveProps } from './types';

export const InteractiveContext = createContext<{
  width: number;
  height: number;
}>({
  width: 0,
  height: 0,
});

function isInRange(x1: number, x2: number, delta: number) {
  return x1 >= x2 - delta && x1 <= x2 + delta;
}

export const Interactive = memo(function InteractiveBase({
  onClick,
  children,
  locations,
  onMove,
}: InteractiveProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onMoveThrottled = useThrottledFunction(onMove);

  const handlePress = useCallback(
    (event: TouchEvent) => {
      if (!locations) {
        onMoveThrottled.current({
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

        if (isInRange(event.point.x, locationX, 30)) {
          locationIndex = i;
          break;
        }
      }

      if (locationIndex !== undefined) {
        onClick?.(locationIndex);
        return;
      }

      onClick?.({ left, top });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, onClick, size.width, size.height],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      onMoveThrottled.current({
        left: clamp(event.point.x / size.width, 0, 1),
        top: clamp(event.point.y / size.height, 0, 1),
      });
    },
    [size.width, size.height, onMoveThrottled],
  );

  const handleTouchUpdate = useCallback(
    ({ point }: TouchEvent) => {
      onMoveThrottled.current({
        left: clamp(point.x / size.width, 0, 1),
        top: clamp(point.y / size.height, 0, 1),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size.width, size.height],
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
        setSize({ width: width - 8, height: height - 8 });
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
          <View
            onLayout={onLayout}
            style={{
              padding: 4,
              marginHorizontal: -4,
            }}
          >
            {children}
          </View>
        </Touchable>
      </TouchableContext.Provider>
    </InteractiveContext.Provider>
  );
});
