import { app, BrowserWindow, ipcMain } from 'electron';
import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { saveFile } from './actions/saveFile';
import { openFile } from './actions/openFile';
import { setMenu } from './actions/setMenu';
import { doubleClickToolbar } from './actions/doubleClickToolbar';
import { ActionContext } from './types';

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      experimentalFeatures: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  const urlHash = '#isElectron=true';
  mainWindow.loadURL(
    app.isPackaged
      ? `https://noya.design${urlHash}`
      : `http://localhost:1234${urlHash}`,
  );

  // Automatically open the DevTools
  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

type ActionMap<T extends { type: string }> = {
  [Property in T['type']]: (
    action: Extract<T, { type: Property }>,
    context: ActionContext,
  ) => void;
};

const actions: ActionMap<MessageFromEmbedded> = {
  setMenu,
  openFile,
  saveFile,
  doubleClickToolbar,
};

ipcMain.on('rendererProcessMessage', (event, data) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  const context: ActionContext = {
    browserWindow,
    sendMessage: (message: MessageFromHost) =>
      event.sender.send('mainProcessMessage', message),
  };

  if (!(data.type in actions)) return;

  actions[data.type](data as any, context);
});
