import { SketchFile } from 'sketch-zip';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';

export type UUID = string;

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type InteractionState =
  | {
      type: 'none';
    }
  | {
      type: 'insertRectangle';
    }
  | {
      type: 'insertOval';
    }
  | {
      type: 'drawing';
      origin: Point;
      value: PageLayer;
    };

export type ApplicationState = {
  interactionState: InteractionState;
  selectedPage: string;
  selectedObjects: string[];
  sketch: SketchFile;
};

export type PageLayer = Sketch.Page['layers'][0];

export type Action =
  | [type: 'addLayer', layer: PageLayer]
  | [type: 'selectLayer', layerId: string]
  | [type: 'selectPage', pageId: UUID]
  | [type: 'interaction', state: InteractionState];

export const addLayerToPage = produce(
  (state: ApplicationState, pageIndex: number, layer: PageLayer) => {
    state.sketch.pages[pageIndex].layers.push(layer);
  },
);

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'addLayer':
      const currentPageIndex = state.sketch.pages.findIndex(
        (page) => page.do_objectID === state.selectedPage,
      );

      if (currentPageIndex === -1) throw new Error('No selected page');

      return addLayerToPage(state, currentPageIndex, action[1]);
    case 'selectLayer':
      return produce(state, (state) => {
        state.selectedObjects = [action[1]];
      });
    case 'selectPage':
      return produce(state, (state) => {
        state.selectedPage = action[1];
      });
    case 'interaction':
      return produce(state, (state) => {
        state.interactionState = action[1];
      });
  }
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    interactionState: { type: 'none' },
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    sketch,
  };
}
