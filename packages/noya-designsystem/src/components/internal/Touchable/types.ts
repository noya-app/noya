import { PropsWithChildren } from 'react';

type TouchCallback = (x: number, y: number) => void;

export type TouchableProps = PropsWithChildren<{
  onPress?: TouchCallback;
  onLongPress?: TouchCallback;
  // onPressStart?: () => void;
  // onPressEnd?: () => void;
  // onPressMove?: () => void;
}>;

export interface TouchableContextType {
  pressHandlers: TouchCallback[];
  longPressHandlers: TouchCallback[];
  // panBeginHandlers: TouchCallback[];
  // panUpdateHandlers: TouchCallback[];
  // panEndHandlers: TouchCallback[];
}
