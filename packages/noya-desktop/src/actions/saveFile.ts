import { dialog } from 'electron';
import { writeFileSync } from 'fs';
import { MessageFromEmbedded } from 'noya-embedded';
import { ActionContext } from '../types';

export function saveFile(
  data: Extract<MessageFromEmbedded, { type: 'saveFile' }>,
  context: ActionContext,
) {
  const name = dialog.showSaveDialogSync(context.browserWindow);

  if (!name) {
    context.sendMessage({
      type: 'didSaveFile',
      id: data.id,
    });

    return;
  }

  const buffer = Buffer.from(data.base64, 'base64');

  try {
    writeFileSync(name, buffer);
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
    name,
  });
}
