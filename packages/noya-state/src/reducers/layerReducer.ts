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
  getLayerIndexPathsExcludingDescendants,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';
import { createPage } from './pageReducer';

export type LayerAction =
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayer', layerId: string | string[], name: string]
  | [type: 'ungroupLayer', layerId: string | string[]]
  | [type: 'addSymbol', layerId: string | string[], name: string]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ];

const getParentLayer = (pages: Sketch.AnyLayer, lastIndexPath: IndexPath) => {
  return Layers.access(pages, lastIndexPath.slice(0, -1)) as Sketch.Page;
};
const addToParentLayer = (
  pages: Sketch.AnyLayer,
  selectedIndexPaths: IndexPath[],
  element: Exclude<Sketch.AnyLayer, { _class: 'page' }>,
) => {
  const lastIndexPath = selectedIndexPaths[selectedIndexPaths.length - 1];
  const parent = getParentLayer(pages, lastIndexPath);

  parent.layers.splice(lastIndexPath[lastIndexPath.length - 1], 0, element);
};

const getReversedDirectChildrensLayersIndexPaths = (
  state: ApplicationState,
  ids: string[],
) => {
  return (
    getLayerIndexPathsExcludingDescendants(state, ids)
      .filter((indexPath) =>
        Layers.isChildLayer(Layers.access(getCurrentPage(state), indexPath)),
      )
      // Reverse the indexPaths to simplify deletion
      .reverse()
  );
};

const createGroup = (
  action: 'group' | 'symbolMaster',
  page: Sketch.Page,
  ids: string[],
  name: string,
  selectedIndexPaths: IndexPath[],
): Sketch.Group | Sketch.SymbolMaster | undefined => {
  const lastIndexPath = selectedIndexPaths[selectedIndexPaths.length - 1];
  const boundingRect = getBoundingRect(page, AffineTransform.identity, ids, {
    clickThroughGroups: true,
    includeHiddenLayers: true,
  });

  if (!boundingRect) {
    console.info('[groupLayer] Selected layers not found');
    return undefined;
  }

  const newParentTransform = getLayerTransformAtIndexPath(page, lastIndexPath);
  const groupFrame = transformRect(boundingRect, newParentTransform.invert());
  const newGroupTransform = AffineTransform.multiply(
    newParentTransform,
    AffineTransform.translation(groupFrame.x, groupFrame.y),
  );

  return produce(
    action === 'group' ? Models.group : Models.symbolMaster,
    (draft) => {
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

      if (draft._class === 'symbolMaster') {
        draft.symbolID = uuid();
      }

      draft.layers = [...selectedIndexPaths].reverse().map((indexPath) => {
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
    },
  );
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

      // We delete in reverse so that the indexPaths remain accurate even
      // after some layers are deleted.
      const reversed = [...indexPaths.reverse()];

      return produce(state, (draft) => {
        deleteLayers(reversed, draft.sketch.pages[pageIndex]);
      });
    }
    case 'groupLayer': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      const selectedIndexPaths = getReversedDirectChildrensLayersIndexPaths(
        state,
        ids,
      );

      const group = createGroup('group', page, ids, name, selectedIndexPaths);
      if (!group) {
        console.info('[groupLayer] Selected layers not found');
        return state;
      }

      // Fire we remove selected layers, then we insert the group layer
      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        deleteLayers(selectedIndexPaths, pages[pageIndex]);

        addToParentLayer(pages[pageIndex], selectedIndexPaths, group);

        draft.selectedObjects = [group.do_objectID];
      });
    }
    case 'ungroupLayer': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      )[0];

      return produce(state, (draft) => {
        const parent = getParentLayer(
          draft.sketch.pages[pageIndex],
          indexPath.slice(0, -1),
        );

        const groupIndex = indexPath[indexPath.length - 1];
        const group = parent.layers[groupIndex] as Sketch.Group;

        parent.layers.splice(groupIndex, 1);
        parent.layers.push(
          ...group.layers.map((l) =>
            produce(l, (l) => {
              l.frame = {
                ...l.frame,
                x: l.frame.x + group.frame.x,
                y: l.frame.y + group.frame.y,
              };
            }),
          ),
        );
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

      const selectedIndexPaths = getReversedDirectChildrensLayersIndexPaths(
        state,
        ids,
      );

      const symbolMasters = createGroup(
        'symbolMaster',
        page,
        ids,
        name,
        selectedIndexPaths,
      ) as Sketch.SymbolMaster;

      if (!symbolMasters) {
        console.info('[groupLayer] Selected layers not found');
        return state;
      }
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

        deleteLayers(selectedIndexPaths, pages[pageIndex]);
        addToParentLayer(pages[pageIndex], selectedIndexPaths, symbolInstance);

        const symbolsPage =
          symbolsPageIndex === -1
            ? createPage(pages, draft.sketch.user, 'Symbols')
            : pages[symbolsPageIndex];
        symbolsPage.layers = [...symbolsPage.layers, symbolMasters];

        draft.selectedObjects = [symbolInstance.do_objectID];
      });
    }
    default:
      return state;
  }
}
