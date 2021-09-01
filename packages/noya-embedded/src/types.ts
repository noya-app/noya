import { ApplicationMenuItemType } from './applicationMenu';

export type MessageFromEmbedded =
  | {
      type: 'setMenu';
      value: Electron.MenuItemConstructorOptions[];
    }
  | {
      type: 'openFile';
      id: number;
      /**
       * If a path is passed, we open the file at that path. Otherwise,
       * we show an open dialog and let the user choose a path.
       */
      path?: string;
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
    }
  | {
      type: 'doubleClickToolbar';
    };

type HostFileMetadata = {
  name: string;
  path: string;
};

export type HostFile = HostFileMetadata & {
  base64: string;
};

export type MessageFromHost =
  | {
      type: 'menuCommand';
      value: ApplicationMenuItemType;
    }
  | {
      type: 'didOpenRecentFile';
      file: HostFile;
    }
  | {
      type: 'didOpenFile';
      id: number;
      file?: HostFile;
    }
  | {
      type: 'didSaveFile';
      id: number;
      file?: HostFileMetadata;
    };
