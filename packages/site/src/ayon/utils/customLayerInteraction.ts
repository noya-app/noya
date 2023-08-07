import { InteractionAPI } from 'noya-canvas';
import { ReactEventHandlers } from 'noya-designsystem';
import { handleActionType, InteractionState } from 'noya-state';
import { ProxyEventHandler } from '../../dseditor/dom';

interface Props {
  onPointerDown?: ProxyEventHandler;
  onPointerMove?: ProxyEventHandler;
  onPointerUp?: ProxyEventHandler;
}

export function customLayerInteraction({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return () =>
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

          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          onPointerDown?.({ point: canvasPoint });

          if (interactionState.layerId === layerId) {
            event.preventDefault();
            return;
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

          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          onPointerMove?.({ point: canvasPoint });

          if (interactionState.layerId === layerId) {
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

          const canvasPoint = api.getCanvasPoint(event.nativeEvent);

          onPointerUp?.({ point: canvasPoint });

          if (interactionState.layerId === layerId) {
            event.preventDefault();
            return;
          }
        },
      }),
    });
}
