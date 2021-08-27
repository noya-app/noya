import { systemPreferences } from 'electron';
import { MessageFromEmbedded } from 'noya-embedded';
import { ActionContext } from '../types';

// Copied from Electron Fiddle (MIT)
// https://github.com/electron/fiddle/blob/1af0e91b73e77dff8e19527aafe175c34182a63a/src/main/main.ts#L83
export function doubleClickToolbar(
  data: Extract<MessageFromEmbedded, { type: 'doubleClickToolbar' }>,
  { browserWindow }: ActionContext,
) {
  if (process.platform !== 'darwin') return;

  const doubleClickAction = systemPreferences.getUserDefault(
    'AppleActionOnDoubleClick',
    'string',
  );

  if (doubleClickAction === 'Minimize') {
    browserWindow.minimize();
  } else if (doubleClickAction === 'Maximize') {
    if (!browserWindow.isMaximized()) {
      browserWindow.maximize();
    } else {
      browserWindow.unmaximize();
    }
  }
}
