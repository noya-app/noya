import path from 'path';
import { dialog } from 'electron';
import { readFileSync } from 'fs';
import { MessageFromEmbedded } from 'noya-embedded';
import { ActionContext } from '../types';

export function openFile(
  data: Extract<MessageFromEmbedded, { type: 'openFile' }>,
  context: ActionContext,
) {
  const filename = data.path
    ? data.path
    : dialog.showOpenDialogSync(
        context.browserWindow,
        data.extensions
          ? {
              filters: [{ name: 'Files', extensions: data.extensions }],
            }
          : {},
      )?.[0];

  if (!filename) {
    context.sendMessage({
      type: 'didOpenFile',
      id: data.id,
    });
  } else {
    context.sendMessage({
      type: 'didOpenFile',
      id: data.id,
      file: {
        name: path.basename(filename),
        path: filename,
        base64: readFileSync(filename, 'base64'),
      },
    });
  }
}
