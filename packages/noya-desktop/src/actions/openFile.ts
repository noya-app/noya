import { dialog } from 'electron';
import { readFileSync } from 'fs';
import { MessageFromEmbedded } from 'noya-embedded';
import { ActionContext } from '../types';

export function openFile(
  data: Extract<MessageFromEmbedded, { type: 'openFile' }>,
  context: ActionContext,
) {
  const files = dialog.showOpenDialogSync(context.browserWindow);

  if (!files) {
    context.sendMessage({
      type: 'didOpenFile',
      id: data.id,
    });
  } else {
    context.sendMessage({
      type: 'didOpenFile',
      id: data.id,
      base64: readFileSync(files[0], 'base64'),
    });
  }
}
