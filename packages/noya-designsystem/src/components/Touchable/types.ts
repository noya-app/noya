import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';
import type {} from // GestureUpdateEvent,
// GestureStateChangeEvent,
// TapGestureHandlerEventPayload,
// PanGestureHandlerEventPayload,
// PinchGestureHandlerEventPayload,
// LongPressGestureHandlerEventPayload,
'react-native-gesture-handler';

// export type PressEvent = GestureStateChangeEvent<TapGestureHandlerEventPayload>;

// export type LongPressEvent =
//   GestureStateChangeEvent<LongPressGestureHandlerEventPayload>;

// export type PanEvent = GestureStateChangeEvent<PanGestureHandlerEventPayload>;
// export type PanUpdateEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>;

// export type PinchEvent =
//   GestureStateChangeEvent<PinchGestureHandlerEventPayload>;
// export type PinchUpdateEvent =
//   GestureUpdateEvent<PinchGestureHandlerEventPayload>;

// export interface PanHandlers {
//   onStart: (event: PanEvent) => void;
//   onUpdate: (event: PanUpdateEvent) => void;
//   onEnd: (event: PanEvent) => void;
// }

// export interface PinchHandlers {
//   onStart: (event: PinchEvent) => void;
//   onUpdate: (event: PinchUpdateEvent) => void;
//   onEnd: (event: PinchEvent) => void;
// }

// export type PressHandler = (event: PressEvent) => void;
// export type DoublePressHandler = (Event: PressEvent) => void;
// export type LongPressHandler = (event: LongPressEvent) => void;

export interface Gestures {
  // onPress?: PressHandler;
  // onLongPress?: LongPressHandler;
  // onDoublePress?: DoublePressHandler;
  // pinchHandlers?: PinchHandlers;
  // panHandlersSingle?: PanHandlers;
  // panHandlersDouble?: PanHandlers;
}

export type TouchableProps = PropsWithChildren<{
  // gestures: Gestures;
  runOnUI?: boolean;
}>;

export type TouchableComponentProps = TouchableProps & ViewProps;

export type TouchableContextType = Gestures[];
