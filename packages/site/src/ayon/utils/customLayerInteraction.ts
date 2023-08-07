import { InteractionAPI } from 'noya-canvas';
import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { CSSProperties } from 'react';
import { ProxyEventHandler } from '../../dseditor/dom';

interface CustomActions {
  setCursor: (cursor: CSSProperties['cursor'] | undefined) => void;
}

interface Props {
  onPointerDown?: ProxyEventHandler;
  onPointerMove?: ProxyEventHandler;
  onPointerUp?: ProxyEventHandler;
}

export function createCustomLayerInteraction({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return (actions: CustomActions) =>
    handleActionType<InteractionState, [InteractionAPI], ReactEventHandlers>({
      editingBlock: (interactionState, api) => ({
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

          if (interactionState.layerId === layerId) {
            onPointerDown?.({ point: api.getCanvasPoint(event.nativeEvent) });
            event.preventDefault();
          }
        },
        onPointerMove: (event) => {
          const layerId = api.getLayerIdAtPoint(
            api.getScreenPoint(event.nativeEvent),
            {
              groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
              includeLayersOutsideArtboardBounds: true,
            },
          );

          onPointerMove?.({ point: api.getCanvasPoint(event.nativeEvent) });

          if (interactionState.layerId === layerId) {
            actions.setCursor('text');
            event.preventDefault();
            return;
          }
        },
        onPointerUp: (event) => {
          const layerId = api.getLayerIdAtPoint(
            api.getScreenPoint(event.nativeEvent),
            {
              groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
              includeLayersOutsideArtboardBounds: true,
            },
          );

          onPointerUp?.({ point: api.getCanvasPoint(event.nativeEvent) });

          if (interactionState.layerId === layerId) {
            event.preventDefault();
            return;
          }
        },
      }),
    });
}
