import { produce } from 'immer';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import {
  CustomReducer,
  Layers,
  ParentLayer,
  Selectors,
  interactionReducer,
} from 'noya-state';
import { enforceSchema } from '../../dseditor/layoutSchema';
import { primitiveElements } from '../../dseditor/primitiveElements';
import { NoyaNode } from '../../dseditor/types';
import { boxSymbolId } from '../symbols/symbolIds';
import { CustomLayerData } from '../types';

export type AyonAction =
  | [
      type: 'setLayerDescription',
      layerId: string,
      description: string | undefined,
    ]
  | [
      type: 'setLayerActiveGenerationIndex',
      layerId: string,
      activeGenerationIndex: number | undefined,
    ]
  | [type: 'setLayerNode', layerId: string, node: NoyaNode | undefined];

const ayonLayerReducer = (
  layer: Sketch.CustomLayer<CustomLayerData>,
  action: AyonAction,
) => {
  switch (action[0]) {
    case 'setLayerNode': {
      const [, , node] = action;

      return produce(layer, (draft) => {
        draft.data.node = node ? enforceSchema(node) : undefined;
      });
    }
    case 'setLayerDescription': {
      const [, , description] = action;

      return produce(layer, (draft) => {
        draft.data.description = description;
      });
    }
    case 'setLayerActiveGenerationIndex': {
      const [, , activeGenerationIndex] = action;

      return produce(layer, (draft) => {
        draft.data.activeGenerationIndex = activeGenerationIndex;
      });
    }
  }
};

export const ayonReducer: CustomReducer<AyonAction> = (state, action) => {
  switch (action[0]) {
    case 'setLayerNode':
    case 'setLayerDescription':
    case 'setLayerActiveGenerationIndex': {
      const [, id] = action;

      const layerIndexPaths = Selectors.getLayerIndexPath(state, id);

      if (!layerIndexPaths) return state;

      const { pageIndex, indexPath } = layerIndexPaths;

      return produce(state, (draft) => {
        const parentPath = indexPath.slice(0, -1);
        const index = indexPath[indexPath.length - 1];
        const parentLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          parentPath,
        ) as ParentLayer;
        const childLayer = parentLayer.layers[index];

        if (!Layers.isCustomLayer<CustomLayerData>(childLayer)) return;

        parentLayer.layers[index] = ayonLayerReducer(childLayer, action);
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = Selectors.getCurrentPageIndex(state);

      return produce(state, (draft) => {
        if (draft.interactionState.type !== 'drawing') return;

        const rect = Selectors.getDrawnLayerRect(
          draft.interactionState.origin,
          draft.interactionState.current,
          draft.interactionState.options,
        );

        const layer = SketchModel.customLayer<CustomLayerData>({
          do_objectID: draft.interactionState.id,
          name: 'Box',
          frame: SketchModel.rect(rect),
          data: {
            description: '',
            node: primitiveElements
              .find((p) => p.id === boxSymbolId)
              ?.initialValue?.(),
          },
        });

        Selectors.addToParentLayer(draft.sketch.pages[pageIndex].layers, layer);

        draft.selectedLayerIds = [layer.do_objectID];

        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
  }
};
