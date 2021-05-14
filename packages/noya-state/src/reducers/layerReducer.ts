import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { AffineTransform, transformRect } from 'noya-geometry';
import { uuid } from 'noya-renderer';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentSymbolsPage,
  getLayerTransformAtIndexPath,
  getLayerIndexPathsExcludingDescendants,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';

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
        reversed.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];
          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;
          parent.layers.splice(childIndex, 1);
        });
      });
    }
    case 'groupLayer': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      const selectedIndexPaths = getLayerIndexPathsExcludingDescendants(
        state,
        ids,
      )
        .filter((indexPath) =>
          Layers.isChildLayer(Layers.access(page, indexPath)),
        )
        // Reverse the indexPaths to simplify deletion
        .reverse();

      const boundingRect = getBoundingRect(
        page,
        AffineTransform.identity,
        ids,
        { clickThroughGroups: true, includeHiddenLayers: true },
      );

      if (!boundingRect) {
        console.info('[groupLayer] Selected layers not found');
        return state;
      }

      const lastIndexPath = selectedIndexPaths[selectedIndexPaths.length - 1];
      const newParentTransform = getLayerTransformAtIndexPath(
        page,
        lastIndexPath,
      );
      const groupFrame = transformRect(
        boundingRect,
        newParentTransform.invert(),
      );
      const newGroupTransform = AffineTransform.multiply(
        newParentTransform,
        AffineTransform.translation(groupFrame.x, groupFrame.y),
      );

      const group = produce(Models.group, (draft) => {
        draft.do_objectID = uuid();
        draft.name = name;
        draft.frame = {
          _class: 'rect',
          constrainProportions: false,
          ...groupFrame,
        };
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
      });

      // Fire we remove selected layers, then we insert the group layer
      return produce(state, (draft) => {
        selectedIndexPaths.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];

          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;

          parent.layers.splice(childIndex, 1);
        });

        const parent = Layers.access(
          draft.sketch.pages[pageIndex],
          lastIndexPath.slice(0, -1),
        ) as Layers.ParentLayer;

        parent.layers.splice(lastIndexPath[lastIndexPath.length - 1], 0, group);

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
        const parent = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath.slice(0, -1),
        ) as Layers.ParentLayer;

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
      const symbolsPageIndex = getCurrentSymbolsPage(state);

      const selectedIndexPaths = getLayerIndexPathsExcludingDescendants(
        state,
        ids,
      )
        .filter((indexPath) =>
          Layers.isChildLayer(Layers.access(page, indexPath)),
        )
        // Reverse the indexPaths to simplify deletion
        .reverse();

      const boundingRect = getBoundingRect(
        page,
        AffineTransform.identity,
        ids,
        { clickThroughGroups: true, includeHiddenLayers: true },
      );

      if (!boundingRect) {
        console.info('[groupLayer] Selected layers not found');
        return state;
      }

      const lastIndexPath = selectedIndexPaths[selectedIndexPaths.length - 1];
      const newParentTransform = getLayerTransformAtIndexPath(
        page,
        lastIndexPath,
      );
      const groupFrame = transformRect(
        boundingRect,
        newParentTransform.invert(),
      );
      const newGroupTransform = AffineTransform.multiply(
        newParentTransform,
        AffineTransform.translation(groupFrame.x, groupFrame.y),
      );

      const symbolMasters = produce(Models.symbolMaster, (draft) => {
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
        draft.symbolID = uuid();
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
      });

      const symbolInstance = produce(Models.symbolInstance, (draft) => {
        draft.do_objectID = uuid();
        draft.name = name;
        draft.frame = symbolMasters.frame;
        draft.style = produce(Models.style, (s) => {
          s.do_objectID = uuid();
        });
        draft.symbolID = symbolMasters.symbolID;
      });

      const createSymbolsPage = (
        pages: Sketch.Page[],
        user: Sketch.User,
      ): Sketch.Page => {
        const newPage = produce(Models.page, (page) => {
          page.do_objectID = uuid();
          page.name = 'Symbols';
          return page;
        });

        user[newPage.do_objectID] = {
          scrollOrigin: '{0, 0}',
          zoomValue: 1,
        };

        pages.push(newPage);
        return pages[pages.length - 2];
      };

      return produce(state, (draft) => {
        selectedIndexPaths.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];

          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;

          parent.layers.splice(childIndex, 1);
        });

        const symbolsPage =
          symbolsPageIndex === -1
            ? createSymbolsPage(draft.sketch.pages, draft.sketch.user)
            : draft.sketch.pages[symbolsPageIndex];

        const crrParent = Layers.access(
          draft.sketch.pages[pageIndex],
          selectedIndexPaths[0].slice(0, -1),
        ) as Sketch.Page;

        symbolsPage.layers.push(symbolMasters);
        crrParent.layers.splice(
          lastIndexPath[lastIndexPath.length - 1],
          0,
          symbolInstance,
        );
        draft.selectedObjects = [symbolInstance.do_objectID];
      });
    }
    default:
      return state;
  }
}
