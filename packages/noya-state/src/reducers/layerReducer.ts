import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { RelativeDropPosition } from 'noya-designsystem';
import { AffineTransform, transformRect } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { uuid } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import {
  addSiblingLayer,
  deleteLayers,
  findPageLayerIndexPaths,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getIndexPathsForGroup,
  getIndexPathsOfArtboardLayers,
  getLayerTransformAtIndexPath,
  getParentLayer,
  getRightMostLayerBounds,
  getSelectedSymbols,
  getSymbols,
  getSymbolsInstancesIndexPaths,
  getSymbolsPageIndex,
  LayerIndexPaths,
  moveLayer,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';
import { createPage } from './pageReducer';

export type LayerAction =
  | [
      type: 'moveLayer',
      layerId: string | string[],
      relativeLayer: string,
      position: RelativeDropPosition,
    ]
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayer', layerId: string | string[], name: string]
  | [type: 'ungroupLayer', layerId: string | string[]]
  | [type: 'createSymbol', layerId: string | string[], name: string]
  | [type: 'detachSymbol', layerId: string | string[]]
  | [type: 'deleteSymbol', ids: string[]]
  | [type: 'duplicateLayer', ids: string[]]
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
  const boundingRect = getBoundingRect(page, AffineTransform.identity, ids, {
    clickThroughGroups: true,
    includeHiddenLayers: true,
    includeArtboardLayers: false,
  });

  if (!boundingRect) {
    console.info('[groupLayer] Selected layers not found');
    return undefined;
  }

  const newParentTransform = getLayerTransformAtIndexPath(page, indexPaths[0]);

  const groupFrame = transformRect(boundingRect, newParentTransform.invert());

  const newGroupTransform = AffineTransform.multiply(
    newParentTransform,
    AffineTransform.translation(groupFrame.x, groupFrame.y),
  );

  return produce(model, (draft) => {
    draft.do_objectID = uuid();
    draft.name = name;
    draft.frame = {
      _class: 'rect',
      constrainProportions: false,
      ...groupFrame,
    };
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

const unGroup = (parent: Layers.ParentLayer, indexPath: IndexPath) => {
  const groupIndex = indexPath[indexPath.length - 1];
  const group = parent.layers[groupIndex] as Sketch.Group;
  return group.layers.map((l) =>
    produce(l, (l) => {
      l.frame = {
        ...l.frame,
        x: l.frame.x + group.frame.x,
        y: l.frame.y + group.frame.y,
      };
    }),
  );
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

      const symbolsInstancesIndexPaths = getSelectedSymbols(
        state,
      ).flatMap((symbol) =>
        getSymbolsInstancesIndexPaths(state, symbol.symbolID),
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
    case 'groupLayer': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      const indexPaths = getIndexPathsForGroup(state, ids);

      const group = createGroup(
        SketchModel.group(),
        page,
        ids,
        name,
        indexPaths,
      );

      if (!group) return state;

      // Fire we remove selected layers, then we insert the group layer
      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        deleteLayers(indexPaths, pages[pageIndex]);
        addSiblingLayer(pages[pageIndex], indexPaths[0], group);

        draft.selectedObjects = [group.do_objectID];
      });
    }
    case 'ungroupLayer':
    case 'detachSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = getIndexPathsForGroup(state, ids)[0];

      return produce(state, (draft) => {
        const parent = getParentLayer(page, indexPaths);
        const pages = draft.sketch.pages[pageIndex];

        if (action[0] === 'ungroupLayer') {
          const layers = unGroup(parent, indexPaths);
          deleteLayers([indexPaths], pages);
          addSiblingLayer(pages, indexPaths, layers);
        } else {
          symbolToGroup(pages, state, parent, indexPaths);
        }

        if (!Layers.isPageLayer(parent)) {
          draft.selectedObjects = [parent.do_objectID];
        }
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedObjects, id, selectionType);
      });
    }
    case 'selectAllLayers': {
      const page = getCurrentPage(state);
      const ids = page.layers.map((layer) => layer.do_objectID);

      return produce(state, (draft) => {
        updateSelection(draft.selectedObjects, ids, 'replace');
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
          draft.selectedObjects = [];
          indexPathsArtboards.forEach((indexPath: IndexPath) => {
            const artboard = Layers.access(page, indexPath) as Sketch.Artboard;

            const symbolMaster = SketchModel.symbolMaster({
              ...artboard,
            });

            addSiblingLayer(pages[pageIndex], indexPath, symbolMaster);
            draft.selectedObjects = [
              ...draft.selectedObjects,
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
            ? createPage(pages, draft.sketch.user, 'Symbols')
            : pages[symbolsPageIndex];

        const symbolInstance = SketchModel.symbolInstance({
          name: symbolMaster.name,
          symbolID: symbolMaster.symbolID,
          frame: originalFrame,
        });

        symbolsPage.layers = [...symbolsPage.layers, symbolMaster];
        addSiblingLayer(pages[pageIndex], indexPaths[0], symbolInstance);

        draft.selectedObjects = [symbolInstance.do_objectID];
      });
    }
    case 'duplicateLayer': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const pages = state.sketch.pages;
      const pagesIndexPaths = findPageLayerIndexPaths(state, (layer) =>
        ids.includes(layer.do_objectID),
      ).reverse();

      return produce(state, (draft) => {
        pagesIndexPaths.forEach((pagesIndexPath) => {
          const { indexPaths, pageIndex } = pagesIndexPath;
          const page = pages[pageIndex];
          const draftPage = draft.sketch.pages[pageIndex];

          indexPaths.forEach((indexPath) => {
            const layer = Layers.access(page, indexPath);
            const elem = produce(layer, (layer) => {
              layer.name = layer.name + ' Copy';

              Layers.visit(layer, (layer) => {
                if (layer.style) layer.style.do_objectID = uuid();
                if (Layers.isSymbolMaster(layer)) {
                  layer.symbolID = uuid();
                  layer.frame = {
                    ...layer.frame,
                    x: layer.frame.x + layer.frame.width + 25,
                    y: layer.frame.y,
                  };
                }
                layer.do_objectID = uuid();
              });
            }) as Exclude<Sketch.AnyLayer, { _class: 'page' }>;

            addSiblingLayer(draftPage, indexPath, elem);
          });
        });
      });
    }

    default:
      return state;
  }
}
