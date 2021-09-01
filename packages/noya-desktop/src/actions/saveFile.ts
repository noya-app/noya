import { app, dialog } from 'electron';
import { writeFileSync } from 'fs';
import { MessageFromEmbedded } from 'noya-embedded';
import path from 'path';
import { ActionContext } from '../types';

export function saveFile(
  data: Extract<MessageFromEmbedded, { type: 'saveFile' }>,
  context: ActionContext,
) {
  const filename =
    data.path ??
    dialog.showSaveDialogSync(
      context.browserWindow,
      data.extensions
        ? {
            filters: [{ name: 'Files', extensions: data.extensions }],
          }
        : {},
    );

  if (!filename) {
    context.sendMessage({
      type: 'didSaveFile',
      id: data.id,
    });

    return;
  }

  const buffer = Buffer.from(data.base64, 'base64');

  try {
    writeFileSync(filename, buffer);

    app.addRecentDocument(filename);
  } catch (e) {
    console.error(e);

    context.sendMessage({
      type: 'didSaveFile',
      id: data.id,
    });

    return;
  }

  context.sendMessage({
    type: 'didSaveFile',
    id: data.id,
    file: {
      name: path.basename(filename),
      path: filename,
    },
  });
}
