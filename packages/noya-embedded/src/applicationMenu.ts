import type * as Electron from 'electron';
import { MenuItem, SEPARATOR_ITEM } from 'noya-designsystem';
import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { Emitter } from 'noya-fonts';
import { getCurrentPlatform, normalizeKeyName } from 'noya-keymap';
import { hostApp } from './hostApp';

/**
 * Electron accelerator names are separated with "+" instead of "-".
 * We also need to normalize the shortcut in case they use our custom "Mod".
 */
function shortcutToAccelerator(shortcut: string): string {
  const normalized = normalizeKeyName(shortcut, getCurrentPlatform(navigator));
  const accelerator = normalized.replaceAll('-', '+');
  return accelerator;
}

export type ApplicationMenuItemType =
  | 'new'
  | 'open'
  | 'save'
  | 'saveAs'
  | 'undo'
  | 'redo'
  | 'showRulers';

export type ApplicationMenuItem = Electron.MenuItemConstructorOptions;

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
    const getApplicationMenuItem = (
      item: MenuItem<ApplicationMenuItemType>,
    ): ApplicationMenuItem => {
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
        };
      }
    };

    const data: MessageFromEmbedded = {
      type: 'setMenu',
      value: [
        {
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
              label: 'Quit',
              role: 'quit',
            },
          ],
        },
        ...menuItems.map(getApplicationMenuItem),
      ],
    };

    hostApp.sendMessage(data);
  };
}

export const applicationMenu = new ApplicationMenu();
