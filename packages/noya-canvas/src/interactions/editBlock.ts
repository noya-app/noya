import { mergeEventHandlers, ReactEventHandlers } from 'noya-designsystem';
import {
  handleActionType,
  InferBlockType,
  InteractionState,
  SelectionType,
} from 'noya-state';
import { defaultCursorInteraction } from './defaultCursor';
import { createDrawingInteraction, DrawingActions } from './drawing';
import { focusInteraction } from './focus';
import { marqueeInteraction } from './marquee';
import { MoveActions, moveInteraction } from './move';
import { ScaleActions, scaleInteraction } from './scale';
import { SelectionActions, selectionInteraction } from './selection';
import { SelectionModeActions } from './selectionMode';
import { InteractionAPI } from './types';

export interface EditBlockActions
  extends SelectionActions,
    MoveActions,
    DrawingActions,
    ScaleActions,
    SelectionModeActions {
  startEditingBlock: (id: string) => void;
  reset: () => void;
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
}

export const createEditBlockInteraction = ({
  inferBlockType,
}: {
  inferBlockType: InferBlockType;
}) =>
  function editBlockInteraction(actions: EditBlockActions) {
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
              includeLayersOutsideArtboardBounds: true,
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
          focusInteraction,
          editBlockSelectionMode,
          createEditBlockInsertMode({
            inferBlockType,
          }),
          scaleInteraction,
          selectionInteraction,
          moveInteraction,
          marqueeInteraction,
          // createDrawingInteraction({
          //   hasMovementThreshold: true,
          //   allowDrawingFromNoneState: true,
          //   inferBlockType,
          // }),
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

function editBlockSelectionMode(actions: EditBlockActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        if (!event.shiftKey) return;

        actions.startMarquee(
          api.getScreenPoint(event.nativeEvent),
          // Feels more natural to deselect
          [],
        );

        event.preventDefault();
      },

      // We don't actually want to change mode, just the cursor
      onPointerMove: (event) => {
        if (!event.shiftKey) return;

        actions.setCursor('cell');
        event.preventDefault();
      },
    }),
  });
}

function createEditBlockInsertMode({
  inferBlockType,
}: {
  inferBlockType: InferBlockType;
}) {
  return (actions: EditBlockActions) => {
    const drawingInteraction = createDrawingInteraction({
      hasMovementThreshold: true,
      allowDrawingFromNoneState: true,
      inferBlockType,
    });

    return handleActionType<
      InteractionState,
      [InteractionAPI],
      ReactEventHandlers
    >({
      none: (interactionState, api) => ({
        onPointerDown: (event) => {
          if (!event[api.platformModKey]) return;

          drawingInteraction(actions)(
            interactionState,
            'none',
            api,
          )?.onPointerDown?.(event);
        },

        // We don't actually want to change mode, just the cursor
        onPointerMove: (event) => {
          if (!event[api.platformModKey]) return;

          actions.setCursor('crosshair');
          event.preventDefault();
        },
      }),
    });
  };
}
