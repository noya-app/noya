import { ContextMenu } from 'noya-designsystem';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';

export type ThemeMenuItemType = 'duplicate' | 'group' | 'ungroup' | 'delete';

export const menuItems: MenuItem<ThemeMenuItemType>[] = [
  { value: 'duplicate', title: 'Duplicate' },
  { value: 'group', title: 'Group' },
  { value: 'ungroup', title: 'Ungroup' },
  ContextMenu.SEPARATOR_ITEM,
  { value: 'delete', title: 'Delete' },
];
