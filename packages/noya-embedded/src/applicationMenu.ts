import type * as Electron from 'electron';
import { MenuItem, SEPARATOR_ITEM } from 'noya-designsystem';
import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { Emitter } from 'noya-fonts';
import { getCurrentPlatform, normalizeKeyName } from 'noya-keymap';
import { hostApp } from './hostApp';

export type ApplicationMenuItemType =
  // File
  | 'new'
  | 'open'
  | 'openRecent'
  | 'clearRecent'
  | 'save'
  | 'saveAs'
  | 'close'
  // Edit
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  // Preferences
  | 'showRulers';

export type ApplicationMenuItem = Electron.MenuItemConstructorOptions;

/**
 * Electron accelerator names are separated with "+" instead of "-".
 * We also need to normalize the shortcut in case they use our custom "Mod".
 */
function shortcutToAccelerator(shortcut: string): string {
  const platform = getCurrentPlatform(navigator);
  const normalized = normalizeKeyName(shortcut, platform);
  const accelerator = normalized.replaceAll('-', '+');
  return accelerator;
}

function getApplicationMenuItem(
  item: MenuItem<ApplicationMenuItemType>,
): ApplicationMenuItem {
  if (item === SEPARATOR_ITEM) {
    return { type: 'separator' };
  } else {
    return {
      id: item.value,
      label: item.title,
      enabled: !item.disabled,
      ...(item.shortcut && {
        accelerator: shortcutToAccelerator(item.shortcut),
      }),
      ...(item.items && {
        submenu: item.items.map(getApplicationMenuItem),
      }),
      role: item.role as ApplicationMenuItem['role'],
    };
  }
}

const aboutMenu: ApplicationMenuItem = {
  label: 'Noya',
  submenu: [
    {
      label: 'About Noya',
      role: 'about',
    },
    {
      type: 'separator',
    },
    {
      id: 'checkForUpdates',
      label: 'Check for Updates...',
    },
    {
      type: 'separator',
    },
    {
      label: 'Services',
      role: 'services',
      submenu: [],
    },
    {
      type: 'separator',
    },
    {
      label: 'Hide Noya',
      accelerator: 'Command+H',
      role: 'hide',
    },
    {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      role: 'hideOthers',
    },
    {
      label: 'Show All',
      role: 'unhide',
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      role: 'quit',
    },
  ],
};

class ApplicationMenu extends Emitter<[ApplicationMenuItemType]> {
  constructor() {
    super();

    hostApp.addListener((data: MessageFromHost) => {
      if (data.type === 'menuCommand') {
        this.emit(data.value);
      }
    });
  }

  setMenu = (menuItems: MenuItem<ApplicationMenuItemType>[]) => {
    const platform = getCurrentPlatform(navigator);

    const data: MessageFromEmbedded = {
      type: 'setMenu',
      value: [
        ...(platform === 'mac' ? [aboutMenu] : []),
        ...menuItems.map(getApplicationMenuItem),
      ],
    };

    hostApp.sendMessage(data);
  };
}

export const applicationMenu = new ApplicationMenu();
