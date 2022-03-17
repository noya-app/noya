import { MenuItem, SEPARATOR_ITEM } from './constants';

function getKeyboardShortcuts<T extends string>(
  item: MenuItem<T>,
): [string, T][] {
  if (item === SEPARATOR_ITEM) return [];

  if (item.items) return item.items.flatMap(getKeyboardShortcuts);

  if (item.disabled || !item.value || !item.shortcut) return [];

  return [[item.shortcut, item.value]];
}

export function getKeyboardShortcutsForMenuItems<T extends string>(
  menuItems: MenuItem<T>[],
  onSelect: (type: T) => void,
): Record<string, () => void> {
  return Object.fromEntries(
    menuItems
      .flatMap(getKeyboardShortcuts)
      .map(([key, value]) => [key, () => onSelect(value)]),
  );
}
