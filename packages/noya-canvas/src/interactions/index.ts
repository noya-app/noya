import { marqueeInteraction } from './marquee';
import { moveInteraction } from './move';
import { selectionInteraction } from './selection';

export namespace Interactions {
  export const move = moveInteraction;
  export const marquee = marqueeInteraction;
  export const selection = selectionInteraction;
}
