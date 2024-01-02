import { KeyMap } from '@noya-app/noya-keymap';
import { unique } from '@noya-app/noya-utils';
import { composeEventHandlers } from '@radix-ui/primitive';
import { useGesture } from 'react-use-gesture';
import { RegularMenuItem } from '../components/internal/Menu';
import { Optional } from '../utils/createSectionedMenu';

function composeAllEventHandlers<E>(...handlers: ((e: E) => void)[]) {
  const [first, ...rest] = handlers;

  return rest.reduce(
    (result, handler) => composeEventHandlers(result, handler),
    first,
  );
}

export type ReactDOMEventHandlers = ReturnType<
  ReturnType<typeof useGesture>
> & {
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyDownCapture?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onKeyUpCapture?: (e: React.KeyboardEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onKeyPressCapture?: (e: React.KeyboardEvent) => void;

  // Special
  onBeforeInput?: (e: InputEvent) => void;
};

export type ReactEventHandlers<MenuItemType extends string = string> =
  ReactDOMEventHandlers & {
    onContributeMenuItems?: () => Optional<RegularMenuItem<MenuItemType>>[];
    keyboardShortcuts?: KeyMap;
    onSelectMenuItem?: (id: string) => void;
  };

export type EventName = keyof ReactEventHandlers;

export function mergeEventHandlers(
  ...handlerMaps: ReactEventHandlers[]
): ReactEventHandlers {
  const eventNames = unique(handlerMaps.map(Object.keys).flat() as EventName[]);

  return Object.fromEntries(
    eventNames.map((eventName) => {
      const handlers = handlerMaps.flatMap((handlerMap) => {
        const value = handlerMap[eventName];
        return value ? [value] : [];
      });

      return [eventName, composeAllEventHandlers(...handlers)];
    }),
  );
}
