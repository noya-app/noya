import { createDrawingInteraction } from './drawing';
import { focusInteraction } from './focus';
import { marqueeInteraction } from './marquee';
import { moveInteraction } from './move';
import { panInteraction } from './pan';
import { selectionInteraction } from './selection';

export namespace Interactions {
  export const focus = focusInteraction;
  export const move = moveInteraction;
  export const marquee = marqueeInteraction;
  export const selection = selectionInteraction;
  export const pan = panInteraction;
  export const createDrawing = createDrawingInteraction;
}
