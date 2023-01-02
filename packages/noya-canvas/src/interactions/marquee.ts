import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point } from 'noya-geometry';
import { handleActionType, InteractionState, SelectionType } from 'noya-state';
import { InteractionAPI } from './types';

export interface MarqueeActions {
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
}: MarqueeActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        startMarquee(api.getScreenPoint(event.nativeEvent));

        event.preventDefault();
      },
    }),
    marquee: (interactionState, api) => ({
      onPointerMove: (event) => {
        const { origin, current } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'emptyOrContainedArtboardOrChildren',
          includeLockedLayers: false,
        });

        selectLayer(layerIds);
        updateMarquee(api.getScreenPoint(event.nativeEvent));

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        const { origin, current } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
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
