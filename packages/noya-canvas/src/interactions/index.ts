import { createDrawingInteraction } from './drawing';
import { editBlockInteraction } from './editBlock';
import { focusInteraction } from './focus';
import { marqueeInteraction } from './marquee';
import { moveInteraction } from './move';
import { panInteraction } from './pan';
import { scaleInteraction } from './scale';
import { selectionInteraction } from './selection';

export namespace Interactions {
  export const focus = focusInteraction;
  export const move = moveInteraction;
  export const scale = scaleInteraction;
  export const marquee = marqueeInteraction;
  export const selection = selectionInteraction;
  export const pan = panInteraction;
  export const createDrawing = createDrawingInteraction;
  export const editBlock = editBlockInteraction;
}
