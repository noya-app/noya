import { useApplicationState } from 'noya-app-state-context';
import { FALLTHROUGH, useKeyboardShortcuts } from 'noya-keymap';
import { Layers, Selectors } from 'noya-state';
import { useArrowKeyShortcuts } from './useArrowKeyShortcuts';

export function useCanvasShortcuts() {
  const [state, dispatch] = useApplicationState();

  const type = state.interactionState.type;

  const isPanning =
    type === 'panMode' || type === 'maybePan' || type === 'panning';

  const isEditingText = Selectors.getIsEditingText(type);

  useArrowKeyShortcuts();

  const handleDeleteKey = () => {
    if (isEditingText) return FALLTHROUGH;

    if (state.selectedGradient) {
      dispatch('deleteStopToGradient');
    } else {
      dispatch('deleteLayer', state.selectedLayerIds);
    }
  };

  useKeyboardShortcuts({
    Backspace: handleDeleteKey,
    Delete: handleDeleteKey,
    Escape: () => dispatch('interaction', ['reset']),
    Shift: () => dispatch('setKeyModifier', 'shiftKey', true),
    Alt: () => dispatch('setKeyModifier', 'altKey', true),
    Space: () => {
      if (isEditingText) return FALLTHROUGH;

      if (state.interactionState.type !== 'none') return;

      dispatch('interaction', ['enablePanMode']);
    },
    Enter: () => {
      if (isEditingText) return FALLTHROUGH;

      switch (state.interactionState.type) {
        case 'editPath': {
          dispatch('interaction', ['reset']);

          break;
        }
        case 'none': {
          const selectedLayers = Selectors.getSelectedLayers(state);

          if (selectedLayers.length > 0) {
            const firstLayer = selectedLayers[0];

            if (Layers.isTextLayer(firstLayer)) {
              dispatch('selectLayer', firstLayer.do_objectID);
              dispatch('interaction', [
                'editingText',
                firstLayer.do_objectID,
                {
                  anchor: 0,
                  head: firstLayer.attributedString.string.length,
                },
              ]);
            } else if (Layers.isPointsLayer(firstLayer)) {
              dispatch(
                'selectLayer',
                selectedLayers
                  .filter(Layers.isPointsLayer)
                  .map((layer) => layer.do_objectID),
              );
              dispatch('interaction', ['editPath']);
            }

            break;
          }
        }
      }
    },
  });

  useKeyboardShortcuts(
    {
      Space: () => {
        if (!isPanning) return;

        dispatch('interaction', ['reset']);
      },
      Shift: () => dispatch('setKeyModifier', 'shiftKey', false),
      Alt: () => dispatch('setKeyModifier', 'altKey', false),
    },
    { eventName: 'keyup' },
  );
}
