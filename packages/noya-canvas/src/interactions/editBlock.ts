import { mergeEventHandlers, ReactEventHandlers } from 'noya-designsystem';
import {
  handleActionType,
  InferBlockType,
  InteractionState,
  SelectionType,
} from 'noya-state';
import { defaultCursorInteraction } from './defaultCursor';
import { createDrawingInteraction, DrawingActions } from './drawing';
import { createMoveInteraction, MoveActions } from './move';
import { createScaleInteraction, ScaleActions } from './scale';
import { SelectionActions, selectionInteraction } from './selection';
import { InteractionAPI } from './types';

export interface EditBlockActions {
  startEditingBlock: (id: string) => void;
  reset: () => void;
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
}

export const createEditBlockInteraction = ({
  inferBlockType,
}: {
  inferBlockType: InferBlockType;
}) =>
  function editBlockInteraction(
    actions: EditBlockActions &
      SelectionActions &
      MoveActions &
      DrawingActions &
      ScaleActions,
  ) {
    const { startEditingBlock, reset } = actions;

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
        onKeyDown: api.handleKeyboardEvent({
          Enter: () => {
            const selectedLayerIds = api.selectedLayerIds;

            if (selectedLayerIds.length > 0) {
              const layerId = selectedLayerIds[0];

              if (api.getLayerTypeById(layerId) === 'symbolInstance') {
                startEditingBlock(layerId);
              }
            }
          },
        }),
      }),
      editingBlock: (interactionState, api) => {
        const handlers = [
          createScaleInteraction({ inferBlockType }),
          selectionInteraction,
          createMoveInteraction({ inferBlockType }),
          createDrawingInteraction({
            allowDrawingFromNoneState: true,
            inferBlockType,
          }),
          defaultCursorInteraction,
        ].map((interaction) =>
          interaction(actions)(interactionState, 'none', api),
        );

        const fallbackInteractions = mergeEventHandlers(...handlers);

        return {
          onPointerDown: (event) => {
            reset();

            fallbackInteractions.onPointerDown?.(event);

            event.preventDefault();
          },
          onPointerMove: fallbackInteractions.onPointerMove,
        };
      },
    });
  };
