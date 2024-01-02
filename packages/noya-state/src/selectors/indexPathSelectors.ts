import type { Sketch } from '@noya-app/noya-file-format';
import { IndexPath } from 'tree-visit';
import { Layers } from '../layer';
import { findIndexPath, INCLUDE_AND_SKIP } from '../layers';
import type { ApplicationState } from '../reducers/applicationReducer';
import type { UUID } from '../types';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';

export type LayerIndexPath = { pageIndex: number; indexPath: IndexPath };

export type LayerIndexPaths = { pageIndex: number; indexPaths: IndexPath[] };

export const getLayerIndexPath = (
  state: ApplicationState,
  id: UUID,
): LayerIndexPath | undefined => {
  const page = getCurrentPage(state);
  const pageIndex = getCurrentPageIndex(state);
  const indexPath = findIndexPath(page, (layer) => layer.do_objectID === id);

  return indexPath ? { pageIndex, indexPath } : undefined;
};

export const findPageLayerIndexPaths = (
  state: ApplicationState,
  predicate: (layer: Sketch.AnyLayer) => boolean,
): LayerIndexPaths[] => {
  return state.sketch.pages.map((page, pageIndex) => ({
    pageIndex: pageIndex,
    indexPaths: Layers.findAllIndexPaths(page, predicate),
  }));
};

export const getSelectedLayerIndexPaths = (
  state: ApplicationState,
): IndexPath[] => {
  const page = getCurrentPage(state);

  return Layers.findAllIndexPaths(page, (layer) =>
    state.selectedLayerIds.includes(layer.do_objectID),
  );
};

export const getLayerIndexPathsExcludingDescendants = (
  state: ApplicationState,
  ids: string[],
): IndexPath[] => {
  const page = getCurrentPage(state);

  return Layers.findAllIndexPaths<Sketch.AnyLayer>(page, (layer) => {
    const included = ids.includes(layer.do_objectID);

    if (included && Layers.isParentLayer(layer)) {
      return INCLUDE_AND_SKIP;
    }

    return included;
  });
};

export const getSelectedLayerIndexPathsExcludingDescendants = (
  state: ApplicationState,
): IndexPath[] => {
  return getLayerIndexPathsExcludingDescendants(state, state.selectedLayerIds);
};

export const getIndexPathsForGroup = (
  state: ApplicationState,
  ids: string[],
) => {
  return getLayerIndexPathsExcludingDescendants(state, ids).filter(
    (indexPath) =>
      Layers.isChildLayer(Layers.access(getCurrentPage(state), indexPath)),
  );
};

export const getIndexPathsOfArtboardLayers = (
  state: ApplicationState,
  ids: string[],
) => {
  return getLayerIndexPathsExcludingDescendants(state, ids).filter(
    (indexPath) =>
      Layers.isArtboard(Layers.access(getCurrentPage(state), indexPath)),
  );
};
