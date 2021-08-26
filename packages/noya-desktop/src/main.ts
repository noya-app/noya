import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { visit } from 'tree-visit';
import { ApplicationMenuItemType, MessageFromMainProcess } from './types';

app.commandLine.appendSwitch('enable-features', '--no-user-gesture-required');

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

ipcMain.on('rendererProcessMessage', (event, data) => {
  switch (data.type) {
    case 'setMenu': {
      visit<Electron.MenuItemConstructorOptions>(
        {
          submenu: data.value,
        },
        {
          getChildren: (options) => {
            if (Array.isArray(options.submenu)) {
              return options.submenu;
            } else {
              return [];
            }
          },
          onEnter: (options) => {
            if (!options.id) return;

            const message: MessageFromMainProcess = {
              type: 'menuCommand',
              value: options.id as ApplicationMenuItemType,
            };

            options.click = () =>
              event.sender.send('mainProcessMessage', message);
          },
        },
      );

      data.value.push({
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      });

      Menu.setApplicationMenu(Menu.buildFromTemplate(data.value));
    }
  }
});
