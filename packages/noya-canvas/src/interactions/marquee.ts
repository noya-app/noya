import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point } from 'noya-geometry';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface MarqueeInteractionHandlers {
  startMarquee: (point: Point) => void;
  updateMarquee: (point: Point) => void;
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
  reset: () => void;
}

export function marqueeInteraction({
  startMarquee,
  updateMarquee,
  selectLayer,
  reset,
}: MarqueeInteractionHandlers) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        startMarquee(api.getRawPoint(event.nativeEvent));

        event.preventDefault();
      },
    }),
    marquee: (interactionState, api) => ({
      onPointerMove: (event) => {
        const { origin, current } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.modKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'emptyOrContainedArtboardOrChildren',
          includeLockedLayers: false,
        });

        selectLayer(layerIds);
        updateMarquee(api.getRawPoint(event.nativeEvent));

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        const { origin, current } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.modKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'emptyOrContainedArtboardOrChildren',
          includeLockedLayers: false,
        });

        reset();
        selectLayer(layerIds);

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
  });
}
