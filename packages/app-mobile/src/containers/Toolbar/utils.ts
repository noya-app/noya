import { useMemo } from 'react';

import { useKeyCommands, Shortcuts } from 'noya-keymap';
import type { ToolbarItem } from './types';

export function useToolbarKeyCommands(items: ToolbarItem[]) {
  const keyCommands: Shortcuts = useMemo(() => {
    return items.reduce((reducer, item) => {
      if (!item.shortcut) {
        return reducer;
      }

      return {
        ...reducer,
        [item.shortcut.cmd]: {
          title: item.shortcut.title,
          menuName: item.shortcut.menuName,
          callback: item.onPress,
        },
      };
    }, {});
  }, [items]);

  useKeyCommands(keyCommands);
}
