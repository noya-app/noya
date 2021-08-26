import type * as Electron from 'electron';

declare global {
  namespace Electron {
    interface IpcMain {
      on(
        type: 'rendererProcessMessage',
        callback: (
          event: IpcMainEvent,
          data: MessageFromRendererProcess,
        ) => void,
      ): void;
    }

    interface WebContents extends NodeJS.EventEmitter {
      send(channel: 'mainProcessMessage', data: MessageFromMainProcess): void;
    }

    interface IpcRenderer {
      on(
        type: 'mainProcessMessage',
        callback: (
          event: IpcRendererEvent,
          data: MessageFromMainProcess,
        ) => void,
      ): void;

      send(
        channel: 'rendererProcessMessage',
        data: MessageFromRendererProcess,
      ): void;
    }
  }
}

export type ApplicationMenuItemType =
  | 'new'
  | 'open'
  | 'save'
  | 'saveAs'
  | 'undo'
  | 'redo'
  | 'showRulers';

export type MessageFromRendererProcess = {
  type: 'setMenu';
  value: Electron.MenuItemConstructorOptions[];
};

export type MessageFromMainProcess = {
  type: 'menuCommand';
  value: ApplicationMenuItemType;
};

export type ApplicationMenuItem = Electron.MenuItemConstructorOptions;
