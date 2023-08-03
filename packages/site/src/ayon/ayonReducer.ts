import { produce } from 'immer';
import { SketchModel } from 'noya-sketch-model';
import { CustomReducer, Selectors, interactionReducer } from 'noya-state';
import { Model } from '../dseditor/builders';
import { buttonSymbolId } from './symbols/symbolIds';
import { CustomLayerData } from './types';

export const ayonReducer: CustomReducer = (state, action) => {
  switch (action[0]) {
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
