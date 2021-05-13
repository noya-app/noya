import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import * as Layers from '../layers';
import { uuid } from 'noya-renderer';
import * as Models from '../models';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getSelectedLayersExcludingDescendants,
} from '../selectors/selectors';
import { createBounds } from 'noya-geometry/src/rect';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';
import { Bounds, Rect } from '../types';

export type LayerAction =
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayer', layerId: string | string[], name: string]
  | [type: 'ungroupLayer', layerId: string | string[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ];

// Where can i move this function ?
const groupFrame = (): ((bounds?: Bounds) => Rect | void) => {
  const lastPoint = {
    x: -Infinity,
    y: -Infinity,
  };

  const frame = {
    x: Infinity,
    y: Infinity,
    width: -Infinity,
    height: -Infinity,
  };

  return (bounds?: Bounds) => {
    if (!bounds) {
      frame.width = lastPoint.x - frame.x;
      frame.height = lastPoint.y - frame.y;
      return frame;
    }

    frame.y = Math.min(bounds.minY, frame.y);
    frame.x = Math.min(bounds.minX, frame.x);
    lastPoint.y = Math.max(bounds.maxY, lastPoint.y);
    lastPoint.x = Math.max(bounds.maxX, lastPoint.x);
  };
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
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      ).reverse();

      const layers = getSelectedLayersExcludingDescendants(state);
      const selectedLayers: Layers.ChildLayer[] = layers.flatMap((layer) =>
        !Layers.isParentLayer(layer) || Layers.isGroup(layer) ? [layer] : [],
      );

      return produce(state, (draft) => {
        const calculateFrame = groupFrame();

        indexPaths.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];
          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;

          const layer = parent.layers.splice(childIndex, 1)[0];

          //TODO: Account for rotations
          calculateFrame(createBounds(layer.frame));
        });

        const frame = calculateFrame() as Rect;

        const layer = produce(Models.group, (layer) => {
          layer.do_objectID = uuid();
          layer.name = name;
          layer.frame = {
            _class: 'rect',
            constrainProportions: false,
            ...frame,
          };
          layer.layers = selectedLayers.map((l) =>
            produce(l, (l) => {
              l.frame = {
                ...l.frame,
                x: l.frame.x - frame.x,
                y: l.frame.y - frame.y,
              };
            }),
          );
        });

        const lastIndexPath = indexPaths[indexPaths.length - 1];

        const parent = Layers.access(
          draft.sketch.pages[pageIndex],
          lastIndexPath.slice(0, -1),
        ) as Layers.ParentLayer;

        parent.layers.splice(lastIndexPath[lastIndexPath.length - 1], 0, layer);
        draft.selectedObjects = [layer.do_objectID];
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
    default:
      return state;
  }
}
