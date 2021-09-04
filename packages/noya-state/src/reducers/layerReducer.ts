import Sketch from 'noya-file-format';
import produce from 'immer';
import { RelativeDropPosition } from 'noya-designsystem';
import { AffineTransform, transformRect } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { getIncrementedName, groupBy, uuid } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import { PageLayer } from '../layers';
import {
  addSiblingLayer,
  deleteLayers,
  findPageLayerIndexPaths,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getIndexPathsForGroup,
  getIndexPathsOfArtboardLayers,
  getLayerIndexPathsExcludingDescendants,
  addToParentLayer,
  getSelectedLayerIndexPathsExcludingDescendants,
  getLayerTransformAtIndexPath,
  getParentLayer,
  getRightMostLayerBounds,
  getSelectedSymbols,
  getSymbols,
  getSymbolsInstancesIndexPaths,
  getSymbolsPageIndex,
  insertLayerAtIndexPath,
  LayerIndexPaths,
  moveLayer,
  removeLayer,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';
import { createPage } from './pageReducer';
import { ApplicationReducerContext, Primitives } from 'noya-state';

export type LayerAction =
  | [
      type: 'moveLayer',
      layerId: string | string[],
      relativeLayer: string,
      position: RelativeDropPosition,
    ]
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayers', layerId: string | string[]]
  | [type: 'ungroupLayers', layerId: string | string[]]
  | [type: 'createSymbol', layerId: string | string[], name: string]
  | [type: 'detachSymbol', layerId: string | string[]]
  | [type: 'deleteSymbol', ids: string[]]
  | [type: 'duplicateLayer', ids: string[]]
  | [type: 'addLayer', data: Sketch.AnyLayer[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [type: 'selectAllLayers'];

const createGroup = <T extends Sketch.Group | Sketch.SymbolMaster>(
  model: T,
  page: Sketch.Page,
  ids: string[],
  name: string,
  indexPaths: IndexPath[],
): T | undefined => {
  const boundingRect = getBoundingRect(page, ids, {
    groups: 'childrenOnly',
    includeHiddenLayers: true,
  });

  if (!boundingRect) {
    console.info('[groupLayer] Selected layers not found');
    return undefined;
  }

  const newParentTransform = getLayerTransformAtIndexPath(page, indexPaths[0]);

  const groupFrame = transformRect(boundingRect, newParentTransform.invert());

  const newGroupTransform = AffineTransform.multiply(
    newParentTransform,
    AffineTransform.translate(groupFrame.x, groupFrame.y),
  );

  return produce(model, (draft) => {
    draft.do_objectID = uuid();
    draft.name = name;
    draft.frame = SketchModel.rect(groupFrame);
    draft.style = SketchModel.style();

    draft.layers = [...indexPaths].map((indexPath) => {
      const layer = Layers.access(page, indexPath) as Layers.ChildLayer;

      const originalParentTransform = getLayerTransformAtIndexPath(
        page,
        indexPath,
      );

      // First we undo original parent's transform, then we apply the new group's transform
      const transform = AffineTransform.multiply(
        originalParentTransform,
        newGroupTransform.invert(),
      );

      return produce(layer, (draftLayer) => {
        draftLayer.frame = {
          ...draftLayer.frame,
          ...transformRect(draftLayer.frame, transform),
        };
      });
    });
  });
};

const symbolToGroup = (
  page: Sketch.Page,
  state: ApplicationState,
  parent: Layers.ParentLayer,
  indexPath: IndexPath,
) => {
  const index = indexPath[indexPath.length - 1];
  const element = parent.layers[index] as Sketch.SymbolInstance;

  const symbol = getSymbols(state).filter(
    (s) => s.symbolID === element.symbolID,
  )[0];

  const group = SketchModel.group({
    name: element.name,
    frame: element.frame,
    layers: symbol.layers.map((l) =>
      produce(l, (l) => {
        l.do_objectID = uuid();
      }),
    ),
  });

  deleteLayers([indexPath], page);
  addSiblingLayer(page, indexPath, group);
};

export const detachSymbolIntances = (
  pages: Sketch.Page[],
  state: ApplicationState,
  symbolsInstancesIndexPaths: LayerIndexPaths[],
) => {
  symbolsInstancesIndexPaths.forEach((element) => {
    const { indexPaths, pageIndex } = element;
    indexPaths.forEach((indexPath) => {
      const page = pages[pageIndex];

      const parent = getParentLayer(page, indexPath);
      symbolToGroup(page, state, parent, indexPath);
    });
  });
};

export function layerReducer(
  state: ApplicationState,
  action: LayerAction,
  context?: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'moveLayer': {
      const [, id, destinationId, rawPosition] = action;

      // Since layers are stored in reverse order, to place a layer "above",
      // we actually place it "below" in terms of index, etc.
      return moveLayer(state, id, destinationId, rawPosition);
    }
    case 'deleteLayer':
    case 'deleteSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const indexPaths = findPageLayerIndexPaths(state, (layer) =>
        ids.includes(layer.do_objectID),
      );

      const symbolsInstancesIndexPaths = getSelectedSymbols(state).flatMap(
        (symbol) => getSymbolsInstancesIndexPaths(state, symbol.symbolID),
      );

      return produce(state, (draft) => {
        detachSymbolIntances(
          draft.sketch.pages,
          state,
          symbolsInstancesIndexPaths,
        );
        indexPaths.forEach((i) =>
          deleteLayers(i.indexPaths, draft.sketch.pages[i.pageIndex]),
        );
      });
    }
    case 'groupLayers': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      const targetIndexPath = indexPaths[0];
      const parentLayer = Layers.access(
        page,
        targetIndexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      const siblingNames = parentLayer.layers.map((layer) => layer.name);

      const group = SketchModel.group({
        name: siblingNames.includes('Group')
          ? getIncrementedName('Group', siblingNames)
          : 'Group',
      });

      // Insert the group layer
      state = insertLayerAtIndexPath(state, group, targetIndexPath, 'above');

      // Move all selected layers into the new group
      return moveLayer(state, ids, group.do_objectID, 'inside');
    }
    case 'ungroupLayers': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      return indexPaths.reduce((state, indexPath) => {
        const groupLayer = Layers.access(page, indexPath);

        if (!Layers.isGroup(groupLayer)) return state;

        const childrenIds = groupLayer.layers.map((layer) => layer.do_objectID);

        state = moveLayer(state, childrenIds, groupLayer.do_objectID, 'above');

        state = removeLayer(state, groupLayer.do_objectID);

        return produce(state, (draft) => {
          updateSelection(
            draft.selectedLayerIds,
            groupLayer.do_objectID,
            'difference',
          );
          updateSelection(draft.selectedLayerIds, childrenIds, 'intersection');
        });
      }, state);
    }
    case 'detachSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = getIndexPathsForGroup(state, ids)[0];

      return produce(state, (draft) => {
        const parent = getParentLayer(page, indexPaths);
        const draftPage = draft.sketch.pages[pageIndex];

        symbolToGroup(draftPage, state, parent, indexPaths);

        if (!Layers.isPageLayer(parent)) {
          draft.selectedLayerIds = [parent.do_objectID];
        }
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedLayerIds, id, selectionType);
      });
    }
    case 'selectAllLayers': {
      const page = getCurrentPage(state);
      const ids = page.layers.map((layer) => layer.do_objectID);

      return produce(state, (draft) => {
        updateSelection(draft.selectedLayerIds, ids, 'replace');
      });
    }
    case 'createSymbol': {
      const [, id, name] = action;
      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPathsArtboards = getIndexPathsOfArtboardLayers(state, ids);

      if (indexPathsArtboards.length > 0) {
        return produce(state, (draft) => {
          const pages = draft.sketch.pages;

          deleteLayers(indexPathsArtboards, pages[pageIndex]);
          draft.selectedLayerIds = [];
          indexPathsArtboards.forEach((indexPath: IndexPath) => {
            const artboard = Layers.access(page, indexPath) as Sketch.Artboard;

            const symbolMaster = SketchModel.symbolMaster({
              ...artboard,
            });

            addSiblingLayer(pages[pageIndex], indexPath, symbolMaster);
            draft.selectedLayerIds = [
              ...draft.selectedLayerIds,
              symbolMaster.do_objectID,
            ];
          });
        });
      }

      const symbolsPageIndex = getSymbolsPageIndex(state);
      const indexPaths = getIndexPathsForGroup(state, ids);
      const symbolMaster = createGroup(
        SketchModel.symbolMaster(),
        page,
        ids,
        name,
        indexPaths,
      );

      if (!symbolMaster) return state;

      const originalFrame = { ...symbolMaster.frame };
      const symbolsPage = state.sketch.pages[symbolsPageIndex];

      const rect = symbolsPage
        ? getRightMostLayerBounds(symbolsPage)
        : { maxX: 0, minY: 25 };

      symbolMaster.frame.x = rect.maxX + 100;
      symbolMaster.frame.y = rect.minY;

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;

        deleteLayers(indexPaths, pages[pageIndex]);

        const symbolsPage =
          symbolsPageIndex === -1
            ? createPage(pages, draft.sketch.user, uuid(), 'Symbols')
            : pages[symbolsPageIndex];

        const symbolInstance = SketchModel.symbolInstance({
          name: symbolMaster.name,
          symbolID: symbolMaster.symbolID,
          frame: originalFrame,
        });

        symbolsPage.layers = [...symbolsPage.layers, symbolMaster];
        addSiblingLayer(pages[pageIndex], indexPaths[0], symbolInstance);

        draft.selectedLayerIds = [symbolInstance.do_objectID];
      });
    }
    case 'duplicateLayer': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      const parentIds = indexPaths.map(
        (indexPath) => getParentLayer(page, indexPath).do_objectID,
      );

      // Layers should be duplicated independently within each parent and placed
      // above the "top" selected layer in that parent.
      const groupedByParent = groupBy(
        indexPaths,
        (indexPath) => getParentLayer(page, indexPath).do_objectID,
      );

      // Insert in reverse order to preserve indexPaths
      const parentIndexPaths = Layers.findAllIndexPaths(page, (layer) =>
        parentIds.includes(layer.do_objectID),
      ).reverse();

      return produce(state, (draft) => {
        const draftPage = draft.sketch.pages[pageIndex];

        draft.selectedLayerIds = [];

        parentIndexPaths.forEach((indexPath) => {
          const originalParent = Layers.access(
            page,
            indexPath,
          ) as Layers.ParentLayer;

          const draftParent = Layers.access(
            draftPage,
            indexPath,
          ) as Layers.ParentLayer;

          const childIndexes = groupedByParent[originalParent.do_objectID].map(
            (indexPath) => indexPath[indexPath.length - 1],
          );

          // Get the index of the "top" layer
          const lastIndex = Math.max(...childIndexes);

          const copiedLayers = childIndexes
            .map((index) => originalParent.layers[index])
            .map(copyLayer);

          // Insert "above" the original in the layer list
          draftParent.layers.splice(lastIndex + 1, 0, ...copiedLayers);

          draft.selectedLayerIds.push(
            ...copiedLayers.map((layer) => layer.do_objectID),
          );
        });
      });
    }
    case 'addLayer': {
      const [, layers] = action;
      const currentPageIndex = getCurrentPageIndex(state);
      const selectedLayerIndexPath =
        getSelectedLayerIndexPathsExcludingDescendants(state)[0];

      if (!context) return state;

      return produce(state, (draft) => {
        const draftPage = draft.sketch.pages[currentPageIndex];
        const selectedLayer =
          selectedLayerIndexPath && selectedLayerIndexPath.length > 0
            ? Layers.access(draftPage, selectedLayerIndexPath)
            : draftPage;

        draft.selectedLayerIds = [];

        let parentLayer = draftPage as Layers.ParentLayer;

        if (Layers.isParentLayer(selectedLayer)) {
          parentLayer = selectedLayer;
        }

        const viewportCenter = {
          x: context.canvasSize.width / 2,
          y: context.canvasSize.height / 2,
        };

        const meta = draft.sketch.user[draftPage.do_objectID] ?? {
          zoomValue: 1,
          scrollOrigin: '{0,0}',
        };

        const parsed = Primitives.parsePoint(meta.scrollOrigin);

        layers.forEach((layer) => {
          const { pageIndex, indexPaths } = findPageLayerIndexPaths(
            state,
            (l) => l.do_objectID === layer.do_objectID,
          )[0];

          if (layer._class === 'page') return;

          const newLayer = produce(copyLayer(layer), (l) => {
            l.name = layer.name;
          });

          const centeredLayer = produce(newLayer, (l) => {
            l.frame = {
              ...newLayer.frame,
              x: viewportCenter.x - parsed.x - layer.frame.width / 2,
              y: viewportCenter.y - parsed.y - layer.frame.height / 2,
            };
          });

          if (parentLayer._class !== 'page') {
            addToParentLayer(parentLayer.layers, newLayer);
          } else if (currentPageIndex === pageIndex && indexPaths.length > 0) {
            addSiblingLayer(draftPage, indexPaths[0], newLayer);
          } else if (selectedLayer._class !== 'page') {
            addSiblingLayer(draftPage, selectedLayerIndexPath, centeredLayer);
          } else {
            draftPage.layers.push(centeredLayer);
          }

          draft.selectedLayerIds.push(newLayer.do_objectID);
        });
      });
    }
    default:
      return state;
  }
}

function copyLayer(targetLayer: PageLayer) {
  return produce(targetLayer, (draft) => {
    draft.name = draft.name + ' Copy';

    Layers.visit(draft, (layer) => {
      layer.do_objectID = uuid();

      if (layer.style) {
        layer.style.do_objectID = uuid();
      }

      if (Layers.isSymbolMasterOrArtboard(layer)) {
        layer.frame.x += layer.frame.width + 100;
      }

      // When we duplicate a symbolMaster, we also duplicate its symbolID.
      // In other words, a duplicated symbolMaster will have no attached instances.
      if (Layers.isSymbolMaster(layer)) {
        layer.symbolID = uuid();
      }
    });
  });
}
