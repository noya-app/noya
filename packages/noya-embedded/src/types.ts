import { ApplicationMenuItemType } from './applicationMenu';

export type MessageFromEmbedded =
  | {
      type: 'setMenu';
      value: Electron.MenuItemConstructorOptions[];
    }
  | {
      type: 'openFile';
      id: number;
    }
  | {
      type: 'saveFile';
      id: number;
      base64: string;
    };

export type MessageFromHost =
  | {
      type: 'menuCommand';
      value: ApplicationMenuItemType;
    }
  | {
      type: 'didOpenFile';
      id: number;
      base64?: string;
    }
  | {
      type: 'didSaveFile';
      id: number;
      name?: string;
    };
