import { app, dialog } from 'electron';
import { readFileSync } from 'fs';
import { MessageFromEmbedded } from 'noya-embedded';
import path from 'path';
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
    app.addRecentDocument(filename);

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
