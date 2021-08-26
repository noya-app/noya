import type * as Electron from 'electron';
import { MenuItem, SEPARATOR_ITEM } from 'noya-designsystem';
import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { Emitter } from 'noya-fonts';
import { hostApp } from './hostApp';

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
          ],
        },
        ...menuItems.map(getApplicationMenuItem),
      ],
    };

    hostApp.sendMessage(data);
  };
}

export const applicationMenu = new ApplicationMenu();
