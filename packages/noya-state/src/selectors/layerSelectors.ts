import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState, Layers, PageLayer } from '../index';
import type { UUID } from '../types';
import { IndexPath } from 'tree-visit';
import { getSelectedLayerIndexPathsExcludingDescendants } from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';
import { createBounds, rectsIntersect } from 'noya-geometry';
import { Draft } from 'immer';

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

export const getSelectedLayers = (
  state: Draft<ApplicationState>,
): PageLayer[] => {
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
  // We delete in reverse so that the indexPaths remain accurate even
  // after some layers are deleted.
  const reversed = [...layers].reverse();

  reversed.forEach((indexPath) => {
    const childIndex = indexPath[indexPath.length - 1];
    const parent = Layers.access(
      page,
      indexPath.slice(0, -1),
    ) as Layers.ParentLayer;
    parent.layers.splice(childIndex, 1);
  });
};

export const getParentLayer = (page: Sketch.AnyLayer, indexPath: IndexPath) =>
  Layers.access(page, indexPath.slice(0, -1)) as Layers.ParentLayer;

export const addSiblingLayer = <
  T extends Exclude<Sketch.AnyLayer, { _class: 'page' }>
>(
  page: Sketch.AnyLayer,
  indexPath: IndexPath,
  layer: T | T[],
) => {
  const parent = getParentLayer(page, indexPath);
  const l = layer instanceof Array ? layer : [layer];
  parent.layers.splice(indexPath[indexPath.length - 1], 0, ...l);
};

export const getRightMostLayerBounds = (page: Sketch.Page) => {
  const layer = page.layers.sort((a, b) => {
    const aBounds = createBounds(a.frame);
    const bBounds = createBounds(b.frame);

    return bBounds.maxX - aBounds.maxX;
  })[0];

  return createBounds(layer.frame);
};

export function findSymbolMaster<T extends Sketch.SymbolMaster | undefined>(
  state: ApplicationState,
  symbolID: string,
): T {
  return Layers.findInArray(
    state.sketch.pages,
    (child) => Layers.isSymbolMaster(child) && symbolID === child.symbolID,
  ) as T;
}

export function addToParentLayer(
  layers: Sketch.AnyLayer[],
  layer: Sketch.AnyLayer,
) {
  const parent = layers
    .filter(
      (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
        Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
    )
    .find((artboard) => rectsIntersect(artboard.frame, layer.frame));

  if (parent && Layers.isChildLayer(layer)) {
    layer.frame.x -= parent.frame.x;
    layer.frame.y -= parent.frame.y;

    parent.layers.push(layer);
  } else {
    layers.push(layer);
  }
}
