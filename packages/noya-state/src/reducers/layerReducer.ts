import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { AffineTransform, transformRect } from 'noya-geometry';
import { uuid } from 'noya-renderer';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  deleteLayers,
  getCurrentPage,
  getBoundingRect,
  getCurrentPageIndex,
  getSymbolsPageIndex,
  getLayerTransformAtIndexPath,
  getIndexPathsForGroup,
  getParentLayer,
  addSiblingLayer,
  getSymbols,
  getSymbolsInstacesIndexPaths,
  findPageLayerIndexPaths,
  getSelectedSymbols,
  LayerIndexPaths,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';
import { createPage } from './pageReducer';

export type LayerAction =
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayer', layerId: string | string[], name: string]
  | [type: 'ungroupLayer', layerId: string | string[]]
  | [type: 'addSymbol', layerId: string | string[], name: string]
  | [type: 'detachSymbol', layerId: string | string[]]
  | [type: 'deleteSymbol', ids: string[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ];

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
    draft.style = produce(Models.style, (s) => {
      s.do_objectID = uuid();
    });

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

  const group = produce(Models.group, (group) => {
    group.do_objectID = uuid();
    group.name = element.name;
    group.frame = element.frame;
    group.layers = symbol.layers.map((l) =>
      produce(l, (l) => {
        l.do_objectID = uuid();
      }),
    );
  });

  deleteLayers([indexPath], page);
  addSiblingLayer(page, indexPath, group);
};

const detacthSymbolIntances = (
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
    case 'deleteLayer': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      const symbolsInstancesIndexPaths = getSelectedSymbols(
        state,
      ).flatMap((symbol) =>
        getSymbolsInstacesIndexPaths(state, symbol.symbolID),
      );

      return produce(state, (draft) => {
        detacthSymbolIntances(
          draft.sketch.pages,
          state,
          symbolsInstancesIndexPaths,
        );
        deleteLayers(indexPaths, draft.sketch.pages[pageIndex]);
      });
    }
    case 'groupLayer': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      const indexPaths = getIndexPathsForGroup(state, ids);

      const group = createGroup(Models.group, page, ids, name, indexPaths);
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

        draft.selectedObjects = [parent.do_objectID];
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedObjects, id, selectionType);
      });
    }
    case 'addSymbol': {
      const [, id, name] = action;
      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const symbolsPageIndex = getSymbolsPageIndex(state);

      const indexPaths = getIndexPathsForGroup(state, ids);

      const symbolMasters = createGroup(
        Models.symbolMaster,
        page,
        ids,
        name,
        indexPaths,
      );

      if (!symbolMasters) return state;

      symbolMasters.symbolID = uuid();
      const symbolInstance = produce(Models.symbolInstance, (draft) => {
        draft.do_objectID = uuid();
        draft.name = name;
        draft.frame = symbolMasters.frame;
        draft.style = produce(Models.style, (s) => {
          s.do_objectID = uuid();
        });
        draft.symbolID = symbolMasters.symbolID;
      });

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;

        deleteLayers(indexPaths, pages[pageIndex]);
        addSiblingLayer(pages[pageIndex], indexPaths[0], symbolInstance);

        const symbolsPage =
          symbolsPageIndex === -1
            ? createPage(pages, draft.sketch.user, 'Symbols')
            : pages[symbolsPageIndex];
        symbolsPage.layers = [...symbolsPage.layers, symbolMasters];

        draft.selectedObjects = [symbolInstance.do_objectID];
      });
    }
    case 'deleteSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;
      const indexPaths = findPageLayerIndexPaths(state, (layer) =>
        ids.includes(layer.do_objectID),
      );

      const symbolsInstancesIndexPaths = getSelectedSymbols(
        state,
      ).flatMap((symbol) =>
        getSymbolsInstacesIndexPaths(state, symbol.symbolID),
      );

      return produce(state, (draft) => {
        detacthSymbolIntances(
          draft.sketch.pages,
          state,
          symbolsInstancesIndexPaths,
        );
        indexPaths.forEach((i) =>
          deleteLayers(i.indexPaths, draft.sketch.pages[i.pageIndex]),
        );
      });
    }
    default:
      return state;
  }
}
