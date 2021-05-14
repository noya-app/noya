import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState, Layers, PageLayer } from '../index';
import type { UUID } from '../types';
import { IndexPath } from 'tree-visit';
import { getSelectedLayerIndexPathsExcludingDescendants } from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';

export const getSelectedLayersExcludingDescendants = (
  state: ApplicationState,
): Sketch.AnyLayer[] => {
  const pageIndex = getCurrentPageIndex(state);

  return getSelectedLayerIndexPathsExcludingDescendants(state).map(
    (layerIndex) => {
      return Layers.access(state.sketch.pages[pageIndex], layerIndex);
    },
  );
};

export const getSelectedTextLayers = (
  state: ApplicationState,
): Sketch.Text[] => {
  return getSelectedLayers(state).filter(
    (layer): layer is Sketch.Text => layer._class === 'text',
  );
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedLayersWithContextSettings = (
  state: ApplicationState,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return (Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[]).filter(
    (layer) => layer._class !== 'artboard' && layer.style?.contextSettings,
  );
};

export const getSelectedLayersWithFixedRadius = (
  state: ApplicationState,
): Sketch.Rectangle[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ).filter((layer): layer is Sketch.Rectangle => layer._class === 'rectangle');
};

export const makeGetPageLayers = (
  state: ApplicationState,
): ((ids: UUID[]) => PageLayer[]) => {
  const page = getCurrentPage(state);

  return (ids: UUID[]) =>
    ids
      .map((id) => page.layers.find((layer) => layer.do_objectID === id))
      .filter((layer): layer is PageLayer => !!layer);
};

export const deleteLayers = (layers: IndexPath[], page: Sketch.Page) => {
  layers.forEach((indexPath) => {
    const childIndex = indexPath[indexPath.length - 1];
    const parent = Layers.access(
      page,
      indexPath.slice(0, -1),
    ) as Layers.ParentLayer;
    parent.layers.splice(childIndex, 1);
  });
};
