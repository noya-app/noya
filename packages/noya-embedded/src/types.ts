import { ApplicationMenuItemType } from './applicationMenu';

export type MessageFromEmbedded =
  | {
      type: 'setMenu';
      value: Electron.MenuItemConstructorOptions[];
    }
  | {
      type: 'openFile';
      id: number;
      extensions?: string[];
    }
  | {
      type: 'saveFile';
      id: number;
      base64: string;
      /**
       * If a path is passed, we save the file to that path. Otherwise,
       * we show a save dialog and let the user choose a path.
       */
      path?: string;
      extensions?: string[];
    };

export type MessageFromHost =
  | {
      type: 'menuCommand';
      value: ApplicationMenuItemType;
    }
  | {
      type: 'didOpenFile';
      id: number;
      file?: {
        name: string;
        path: string;
        base64: string;
      };
    }
  | {
      type: 'didSaveFile';
      id: number;
      file?: {
        name: string;
        path: string;
      };
    };
