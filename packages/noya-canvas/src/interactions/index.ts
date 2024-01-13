import { clipboardInteraction } from './clipboard';
import { defaultCursorInteraction } from './defaultCursor';
import { createDrawingInteraction } from './drawing';
import { duplicateInteraction } from './duplicate';
import { createEditBlockInteraction } from './editBlock';
import { editTextInteraction } from './editText';
import { escapeInteraction } from './escape';
import { focusInteraction } from './focus';
import { historyInteraction } from './history';
import { createInsertModeInteraction } from './insertMode';
import { marqueeInteraction } from './marquee';
import { createMoveInteraction, moveInteraction } from './move';
import { panInteraction } from './pan';
import { reorderInteraction } from './reorder';
import { createScaleInteraction, scaleInteraction } from './scale';
import { selectionInteraction } from './selection';
import { selectionModeInteraction } from './selectionMode';
import { zoomInteraction } from './zoom';

export namespace Interactions {
  export const focus = focusInteraction;
  export const move = moveInteraction;
  export const marquee = marqueeInteraction;
  export const selection = selectionInteraction;
  export const pan = panInteraction;
  export const insertMode = createInsertModeInteraction();
  export const editText = editTextInteraction;
  export const editBlock = createEditBlockInteraction();
  export const clipboard = clipboardInteraction;
  export const history = historyInteraction;
  export const escape = escapeInteraction;
  export const zoom = zoomInteraction;
  export const reorder = reorderInteraction;
  export const duplicate = duplicateInteraction;
  export const defaultCursor = defaultCursorInteraction;
  export const selectionMode = selectionModeInteraction;
  export const scale = scaleInteraction;

  export const createScale = createScaleInteraction;
  export const createMove = createMoveInteraction;
  export const createDrawing = createDrawingInteraction;
  export const createInsertMode = createInsertModeInteraction;
  export const createEditBlock = createEditBlockInteraction;
}
