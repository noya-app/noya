// import type Sketch from '@sketch-hq/sketch-file-format-ts';
import type { ApplicationState, PageLayer } from './index';

export const getCurrentPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
};

export const getCurrentPage = (state: ApplicationState) => {
  return state.sketch.pages[getCurrentPageIndex(state)];
};

export const getSelectedLayerIndexes = (state: ApplicationState): number[] => {
  const page = getCurrentPage(state);

  return state.selectedObjects
    .map((id) => page.layers.findIndex((layer) => layer.do_objectID === id))
    .filter((index) => index !== -1);
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return state.selectedObjects
    .map((id) => page.layers.find((layer) => layer.do_objectID === id))
    .filter((layer): layer is PageLayer => !!layer);
};
