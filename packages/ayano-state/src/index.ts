import { SketchFile } from 'sketch-zip';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';

export type UUID = string;

export type ApplicationState = {
  selectedPage: string;
  selectedObjects: string[];
  sketch: SketchFile;
};

export type PageLayer = Sketch.Page['layers'][0];

export type Action = { type: 'addLayer'; layer: PageLayer };

export const addLayerToPage = produce(
  (state: ApplicationState, pageIndex: number, layer: PageLayer) => {
    state.sketch.pages[pageIndex].layers.push(layer);
  },
);

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action.type) {
    case 'addLayer':
      const currentPageIndex = state.sketch.pages.findIndex(
        (page) => page.do_objectID === state.selectedPage,
      );

      if (currentPageIndex === -1) throw new Error('No selected page');

      return addLayerToPage(state, currentPageIndex, action.layer);
  }
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    sketch,
  };
}
