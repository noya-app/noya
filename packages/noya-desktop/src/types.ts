import { BrowserWindow } from 'electron';
import { MessageFromHost, MessageFromEmbedded } from 'noya-embedded';

declare global {
  namespace Electron {
    interface IpcMain {
      on(
        type: 'rendererProcessMessage',
        callback: (event: IpcMainEvent, data: MessageFromEmbedded) => void,
      ): void;
    }

    interface WebContents extends NodeJS.EventEmitter {
      send(channel: 'mainProcessMessage', data: MessageFromHost): void;
    }

    interface IpcRenderer {
      on(
        type: 'mainProcessMessage',
        callback: (event: IpcRendererEvent, data: MessageFromHost) => void,
      ): void;

      send(channel: 'rendererProcessMessage', data: MessageFromEmbedded): void;
    }
  }
}

export type ActionContext = {
  browserWindow: BrowserWindow;
  sendMessage: (message: MessageFromHost) => void;
};
