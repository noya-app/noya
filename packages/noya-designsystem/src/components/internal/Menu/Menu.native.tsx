// TODO: fix me after moving Theme to designsystem
import { Theme } from 'noya-web-designsystem';

export const styles = {
  contentStyle: ({
    theme,
    scrollable,
  }: {
    theme: Theme;
    scrollable?: boolean;
  }) => ({
    borderRadius: 4,
    backgroundColor: theme.colors.popover.background,
    padding: 4,
    // ...(scrollable && {
    //   height: '100%',
    //   maxHeight: 'calc(100vh - 80px)',
    //   overflow: 'hidden auto',
    // }),
    borderWidth: 1,
    borderColor: theme.colors.divider,
  }),

  itemStyle: ({ theme, disabled }: { theme: Theme; disabled?: boolean }) => ({
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  }),

  separatorStyle: ({ theme }: { theme: Theme }) => ({
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 8,
    marginVertical: 4,
  }),
};

export function getKeyboardShortcutsForMenuItems() {
  throw new Error(
    'Menu.native.tsx getKeyboardShortcutsForMenuItems not implemented!',
  );
}

export const KeyboardShortcut = function KeyboardShortcut() {
  throw new Error('Menu.native.tsx KeyboardShortcut not implemented!');
};
