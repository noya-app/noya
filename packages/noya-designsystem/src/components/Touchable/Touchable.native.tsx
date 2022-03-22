import React, {
  memo,
  useMemo,
  useContext,
  useCallback,
  createContext,
  PropsWithChildren,
  useRef,
} from 'react';
import { View, ViewProps, GestureResponderEvent } from 'react-native';

import {
  Gesture,
  TouchableProps,
  TouchableContextType,
  TouchableComponentProps,
  TouchMeta,
  GestureType,
} from './types';
import {
  initMeta,
  getPoint,
  getTouchMeta,
  PanThreshold,
  mergeHandlers,
  PinchThreshold,
  initialHandlers,
  touchableEventNames,
  LongPressThresholdMS,
  getDistance,
} from './utils';

const TouchableContext = createContext<TouchableContextType>(initialHandlers);

export const useTouchableContext = (): TouchableContextType | undefined => {
  const value = useContext(TouchableContext);

  return value;
};

const TouchableListenerInner: React.FC<PropsWithChildren<TouchableProps>> = (
  props,
) => {
  const { children, ...touchableProps } = props;
  const parentHandlers = useTouchableContext();

  const handlers = useMemo(() => {
    const mergedHandlers: TouchableContextType = { ...initialHandlers };

    (touchableEventNames as (keyof TouchableContextType)[]).forEach((name) => {
      mergedHandlers[name] = mergeHandlers(
        parentHandlers?.[name] ?? [],
        touchableProps[name],
      );
    });

    return mergedHandlers;
  }, [parentHandlers, touchableProps]);

  return (
    <TouchableContext.Provider value={handlers}>
      {children}
    </TouchableContext.Provider>
  );
};

const Touchable: React.FC<TouchableComponentProps> = (props) => {
  const lastTouchMeta = useRef<TouchMeta>(initMeta);
  const touchStartTimestamp = useRef<number>(0);
  const gestureHandled = useRef<boolean>(false);

  const { children, ...restProps } = props;
  const handlers = useTouchableContext();

  const setMeta = useCallback((event: GestureResponderEvent) => {
    lastTouchMeta.current = getTouchMeta(event);
  }, []);

  const getGesture = useCallback((event: GestureResponderEvent): Gesture => {
    const touchMeta = getTouchMeta(event);
    const { centroid: currentPos, avgDistance: currentAvgDist } = touchMeta;
    const { centroid: lastPos, avgDistance: lastAvgDist } =
      lastTouchMeta.current;

    lastTouchMeta.current = touchMeta;
    const deltaAvgDistance = Math.abs(currentAvgDist - lastAvgDist);
    const deltaDistance = getDistance(currentPos, lastPos);

    if (deltaAvgDistance > PinchThreshold) {
      return {
        type: GestureType.Pinch,
        point: currentPos,
        scale: currentAvgDist / lastAvgDist,
        absolutePoint: touchMeta.absolutePoint,
        numOfPointers: touchMeta.numOfPointers,
      };
    }

    if (deltaDistance > PanThreshold) {
      return {
        type: GestureType.Pan,
        point: currentPos,
        absolutePoint: touchMeta.absolutePoint,
        numOfPointers: touchMeta.numOfPointers,
        delta: {
          x: lastPos.x - currentPos.x,
          y: lastPos.y - currentPos.y,
        },
      };
    }

    return {
      type: GestureType.None,
      point: currentPos,
      absolutePoint: touchMeta.absolutePoint,
      numOfPointers: touchMeta.numOfPointers,
    };
  }, []);

  const onCallHandlers = useCallback(
    (eventName: keyof TouchableContextType, params: Gesture) => {
      restProps[eventName]?.(params);
      handlers?.[eventName].forEach((handler) => handler(params));
    },
    [handlers, restProps],
  );

  const onSetResponder = useCallback(() => true, []);

  const onTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      touchStartTimestamp.current = Date.now();
      gestureHandled.current = false;
      const point = getPoint(event);
      setMeta(event);

      onCallHandlers('onTouchStart', {
        point,
        type: GestureType.None,
        numOfPointers: event.nativeEvent.touches.length || 1,
        absolutePoint: {
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
        },
      });
    },
    [onCallHandlers, setMeta],
  );

  const onTouchUpdate = useCallback(
    (event: GestureResponderEvent) => {
      const gesture = getGesture(event);

      onCallHandlers('onTouchUpdate', gesture);
      gestureHandled.current =
        gestureHandled.current || gesture.type !== GestureType.None;
    },
    [onCallHandlers, getGesture],
  );

  const onTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      const gesture = getGesture(event);
      const timeNow = Date.now();
      lastTouchMeta.current = initMeta;

      onCallHandlers('onTouchEnd', gesture);

      if (gesture.type !== GestureType.None || gestureHandled.current) {
        return;
      }

      if (timeNow - touchStartTimestamp.current < LongPressThresholdMS) {
        onCallHandlers('onPress', gesture);
      } else {
        onCallHandlers('onLongPress', gesture);
      }
    },
    [onCallHandlers, getGesture],
  );

  const viewProps = useMemo(() => {
    const resultProps: ViewProps = {};

    for (const key in restProps) {
      if (!touchableEventNames.includes(key)) {
        // @ts-ignore
        resultProps[key] = restProps[key];
      }
    }

    return resultProps;
  }, [restProps]);

  return (
    <View
      {...viewProps}
      onStartShouldSetResponder={onSetResponder}
      onResponderGrant={onTouchStart}
      onResponderMove={onTouchUpdate}
      onResponderRelease={onTouchEnd}
    >
      {children}
    </View>
  );
};

export const TouchableListener = memo(TouchableListenerInner);
export default memo(Touchable);