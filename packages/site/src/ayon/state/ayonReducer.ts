import { produce } from 'immer';
import { SketchModel } from 'noya-sketch-model';
import {
  CustomReducer,
  Layers,
  Selectors,
  interactionReducer,
} from 'noya-state';
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
  | [type: 'setLayerNode', layerId: string, node: NoyaNode | undefined];

export const ayonReducer: CustomReducer<AyonAction> = (state, action) => {
  switch (action[0]) {
    case 'setLayerNode': {
      const [, id, node] = action;

      const layerIndexPaths = Selectors.getLayerIndexPath(state, id);

      if (!layerIndexPaths) return state;

      const { pageIndex, indexPath } = layerIndexPaths;

      return produce(state, (draft) => {
        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        if (!Layers.isCustomLayer<CustomLayerData>(draftLayer)) return;

        draftLayer.data.node = node;
      });
    }
    case 'setLayerDescription': {
      const [, id, description] = action;

      const layerIndexPaths = Selectors.getLayerIndexPath(state, id);

      if (!layerIndexPaths) return state;

      const { pageIndex, indexPath } = layerIndexPaths;

      return produce(state, (draft) => {
        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        if (!Layers.isCustomLayer<CustomLayerData>(draftLayer)) return;

        draftLayer.data.description = description;
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
