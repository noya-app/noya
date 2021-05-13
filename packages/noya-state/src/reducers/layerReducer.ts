import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import * as Layers from '../layers';
import { uuid } from 'noya-renderer';
import * as Models from '../models';
import { getCurrentPage, getCurrentPageIndex } from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState } from './applicationReducer';

export type LayerAction =
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayer', layerId: string | string[], name: string]
  | [type: 'ungroupLayer', layerId: string | string[]]
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
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      const reversed = [...indexPaths.reverse()];
      const selectedLayers: (Layers.ChildLayer | Sketch.Group)[] = [];

      const addLayers = (layer: Sketch.AnyLayer) => {
        if (Layers.isParentLayer(layer) && !Layers.isGroup(layer)) return;
        selectedLayers.push(layer);
      };

      return produce(state, (draft) => {
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

        reversed.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];
          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;

          const layer = parent.layers.splice(childIndex, 1)[0];
          frame.y = layer.frame.y < frame.y ? layer.frame.y : frame.y;
          frame.x = layer.frame.x < frame.x ? layer.frame.x : frame.x;

          const endPointY = layer.frame.y + layer.frame.height;
          const endPointX = layer.frame.x + layer.frame.width;
          lastPoint.y = endPointY > lastPoint.y ? endPointY : lastPoint.y;
          lastPoint.x = endPointX > lastPoint.x ? endPointX : lastPoint.x;

          addLayers(layer);
        });

        frame.width = lastPoint.x - frame.x;
        frame.height = lastPoint.y - frame.y;

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

        const parent = Layers.access(
          draft.sketch.pages[pageIndex],
          reversed.slice(-1)[0].slice(0, -1),
        ) as Layers.ParentLayer;

        parent.layers.push(layer);
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
          ...[...group.layers].map((l) =>
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
