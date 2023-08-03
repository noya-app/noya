import { produce } from 'immer';
import { SketchModel } from 'noya-sketch-model';
import {
  CustomReducer,
  Layers,
  Selectors,
  accessPageLayers,
  interactionReducer,
} from 'noya-state';
import { Model } from '../../dseditor/builders';
import { buttonSymbolId } from '../symbols/symbolIds';
import { CustomLayerData } from '../types';

export type AyonAction = [type: 'setLayerDescription', description: string];

export const ayonReducer: CustomReducer<AyonAction> = (state, action) => {
  switch (action[0]) {
    case 'setLayerDescription': {
      const [, description] = action;

      const pageIndex = Selectors.getCurrentPageIndex(state);
      const layerIndexPaths = Selectors.getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
          (draftLayer) => {
            if (!Layers.isCustomLayer<CustomLayerData>(draftLayer)) return;
            draftLayer.data.description = description;
          },
        );
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
          name: 'Button',
          frame: SketchModel.rect(rect),
          data: {
            node: Model.primitiveElement({
              componentID: buttonSymbolId,
              children: [Model.string('Submit')],
            }),
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
