import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { createRect, Point } from '@noya-app/noya-geometry';
import {
  handleActionType,
  InteractionMethod,
  InteractionState,
  makeSelection,
  SelectionType,
} from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { SelectionActions, selectionInteraction } from './selection';
import { InteractionAPI } from './types';

export interface MarqueeActions extends SelectionActions {
  maybeMarquee: (point: Point, method: InteractionMethod) => void;
  startMarquee: (point: Point, selectedIds: string[]) => void;
  updateMarquee: (point: Point) => void;
  selectLayer: (id: string[], selectionType?: SelectionType) => void;
  reset: () => void;
}

export function marqueeInteraction(actions: MarqueeActions) {
  const { maybeMarquee, startMarquee, updateMarquee, selectLayer, reset } =
    actions;

  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onPointerDown: (event) => {
        maybeMarquee(api.getScreenPoint(event.nativeEvent), 'keyboard');

        event.preventDefault();
      },
    }),
    maybeMarquee: (interactionState, api) => ({
      onPointerMove: (event) => {
        const current = api.getScreenPoint(event.nativeEvent);

        const { origin } = interactionState;

        if (isMoving(origin, current, api.zoomValue)) {
          startMarquee(origin, api.selectedLayerIds);
        }

        event.preventDefault();
      },
      onPointerUp: (event) => {
        reset();

        selectionInteraction(actions)(
          interactionState,
          'none',
          api,
        ).onPointerDown?.(event);
      },
    }),
    marquee: (interactionState, api) => ({
      onPointerMove: (event) => {
        const { origin, current } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'childrenOnly',
          includeLockedLayers: false,
          // includePartiallyContainedLayers: origin.x < current.x,
          // includeLayersOutsideArtboardBounds: true,
        });

        selectLayer(layerIds);
        updateMarquee(api.getScreenPoint(event.nativeEvent));

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        const { origin, current, selectedIdsSnapshot } = interactionState;

        if (!isMoving(origin, current, api.zoomValue)) {
          const layerId = api.getLayerIdAtPoint(createRect(origin, current), {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'childrenOnly',
            includeLockedLayers: false,
            // includeLayersOutsideArtboardBounds: true,
          });

          const layerIds = layerId ? [layerId] : [];

          reset();
          selectLayer(
            makeSelection(selectedIdsSnapshot, layerIds, 'symmetricDifference'),
          );
        } else {
          const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'childrenOnly',
            includeLockedLayers: false,
            // includePartiallyContainedLayers: origin.x < current.x,
            // includeLayersOutsideArtboardBounds: true,
          });

          reset();
          selectLayer(layerIds);
        }

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
  });
}
