import { copyPasteInteraction } from './copyPaste';
import { createDrawingInteraction } from './drawing';
import { editBlockInteraction } from './editBlock';
import { editTextInteraction } from './editText';
import { escapeInteraction } from './escape';
import { focusInteraction } from './focus';
import { createInsertModeInteraction } from './insertMode';
import { marqueeInteraction } from './marquee';
import { moveInteraction } from './move';
import { panInteraction } from './pan';
import { reorderInteraction } from './reorder';
import { createScaleInteraction } from './scale';
import { selectionInteraction } from './selection';

export namespace Interactions {
  export const focus = focusInteraction;
  export const move = moveInteraction;
  export const marquee = marqueeInteraction;
  export const selection = selectionInteraction;
  export const pan = panInteraction;
  export const createDrawing = createDrawingInteraction;
  export const createInsertMode = createInsertModeInteraction;
  export const editBlock = editBlockInteraction;
  export const editText = editTextInteraction;
  export const copyPaste = copyPasteInteraction;
  export const escape = escapeInteraction;
  export const reorder = reorderInteraction;

  export const scale = createScaleInteraction();
  export const createScale = createScaleInteraction;
}
