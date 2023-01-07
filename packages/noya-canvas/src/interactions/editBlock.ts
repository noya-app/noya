import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface EditBlockActions {
  startEditingBlock: (id: string) => void;
  reset: () => void;
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
}

export function editBlockInteraction({
  startEditingBlock,
  reset,
  selectLayer,
}: EditBlockActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        const layerId = api.getLayerIdAtPoint(
          api.getScreenPoint(event.nativeEvent),
          {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        if (
          api.getClickCount() > 1 &&
          layerId &&
          api.getLayerTypeById(layerId) === 'symbolInstance'
        ) {
          startEditingBlock(layerId);
          event.preventDefault();
        }
      },
    }),
    editingBlock: () => ({
      onPointerDown: (event) => {
        reset();
        selectLayer([]);
        event.preventDefault();
      },
    }),
  });
}
