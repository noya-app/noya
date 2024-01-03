import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { InteractionAPI } from 'noya-canvas';
import { handleActionType, InteractionState } from 'noya-state';
import { CSSProperties } from 'react';
import { ProxyMouseEventHandler } from '../../dseditor/dom';

interface CustomActions {
  setCursor: (cursor: CSSProperties['cursor'] | undefined) => void;
}

interface Props {
  onPointerDown?: ProxyMouseEventHandler;
  onPointerMove?: ProxyMouseEventHandler;
  onPointerUp?: ProxyMouseEventHandler;
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
              // includeLayersOutsideArtboardBounds: true,
            },
          );

          if (interactionState.layerId === layerId) {
            onPointerDown?.({
              point: api.getLayerPoint(layerId, event.nativeEvent),
            });

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
              // includeLayersOutsideArtboardBounds: true,
            },
          );

          if (interactionState.layerId === layerId) {
            onPointerMove?.({
              point: api.getLayerPoint(layerId, event.nativeEvent),
            });

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
              // includeLayersOutsideArtboardBounds: true,
            },
          );

          if (interactionState.layerId === layerId) {
            onPointerUp?.({
              point: api.getLayerPoint(layerId, event.nativeEvent),
            });

            event.preventDefault();
            return;
          }
        },
      }),
    });
}
