import { ApplicationMenuItemType } from './applicationMenu';

export * from './applicationMenu';

export type MessageFromEmbedded = {
  type: 'setMenu';
  value: Electron.MenuItemConstructorOptions[];
};

export type MessageFromHost = {
  type: 'menuCommand';
  value: ApplicationMenuItemType;
};
