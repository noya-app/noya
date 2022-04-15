import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  createContext,
} from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LayoutChangeEvent, View } from 'react-native';

import { PanEvent, PanUpdateEvent } from 'noya-designsystem';
import { InteractiveProps } from './types';
import { clamp } from '../utils/clamp';

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

  const onStart = useCallback(
    (event: PanEvent) => {
      if (!locations) {
        onMove({
          left: clamp(event.x / size.width, 0, 1),
          top: clamp(event.y / size.height, 0, 1),
        });
        return;
      }

      let locationIndex: number | undefined = undefined;
      const left = clamp(event.x / size.width, 0, 1);
      const top = clamp(event.y / size.height, 0, 1);

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
    [locations, onClick, onMove, size],
  );

  const onUpdate = useCallback(
    (event: PanUpdateEvent) => {
      onMove({
        left: clamp(event.x / size.width, 0, 1),
        top: clamp(event.y / size.height, 0, 1),
      });
    },
    [onMove, size],
  );

  const onEnd = useCallback(() => {}, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onStart(onStart)
        .onChange(onUpdate)
        .onEnd(onEnd),
    [onStart, onUpdate, onEnd],
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
      <GestureDetector gesture={gesture}>
        <View onLayout={onLayout}>{children}</View>
      </GestureDetector>
      {/* <Touchable
        gestures={{ panHandlersSingle: dragHandlers, onPress }}
        onLayout={onLayout}
      >
      </Touchable> */}
    </InteractiveContext.Provider>
  );
});
