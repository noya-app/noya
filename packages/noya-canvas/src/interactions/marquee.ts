import { ReactEventHandlers } from 'noya-designsystem';
import { createRect, Point } from 'noya-geometry';
import {
  handleActionType,
  InteractionState,
  makeSelection,
  SelectionType,
} from 'noya-state';
import { isMoving } from '../utils/isMoving';
import { InteractionAPI } from './types';

export interface MarqueeActions {
  startMarquee: (point: Point, selectedIds: string[]) => void;
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
        startMarquee(
          api.getScreenPoint(event.nativeEvent),
          api.selectedLayerIds,
        );

        event.preventDefault();
      },
    }),
    marquee: (interactionState, api) => ({
      onPointerMove: (event) => {
        const { origin, current, selectedIdsSnapshot } = interactionState;

        const layerIds = api.getLayerIdsInRect(createRect(origin, current), {
          groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
          artboards: 'childrenOnly',
          includeLockedLayers: false,
          includePartiallyContainedLayers: origin.x > current.x,
        });

        selectLayer(
          makeSelection(selectedIdsSnapshot, layerIds, 'symmetricDifference'),
        );
        updateMarquee(api.getScreenPoint(event.nativeEvent));

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onPointerUp: (event) => {
        const { origin, current, selectedIdsSnapshot } = interactionState;

        let layerIds: string[];

        if (!isMoving(origin, current, api.zoomValue)) {
          const layerId = api.getLayerIdAtPoint(createRect(origin, current), {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'childrenOnly',
            includeLockedLayers: false,
          });

          layerIds = layerId ? [layerId] : [];
        } else {
          layerIds = api.getLayerIdsInRect(createRect(origin, current), {
            groups: event[api.platformModKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'childrenOnly',
            includeLockedLayers: false,
            includePartiallyContainedLayers: origin.x > current.x,
          });
        }

        reset();
        selectLayer(
          makeSelection(selectedIdsSnapshot, layerIds, 'symmetricDifference'),
        );

        api.releasePointerCapture?.(event.pointerId);
        event.preventDefault();
      },
    }),
  });
}
