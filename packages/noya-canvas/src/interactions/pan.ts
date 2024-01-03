import { ReactEventHandlers } from '@noya-app/noya-designsystem';
import { Point } from '@noya-app/noya-geometry';
import { handleActionType, InteractionState } from 'noya-state';
import { InteractionAPI } from './types';

export interface PanActions {
  pan: (delta: Point) => void;
  maybePan: (point: Point) => void;
  startPanning: (point: Point) => void;
  updatePanning: (point: Point) => void;
  enablePanMode: () => void;
  reset: () => void;
}

/**
 * Pan mode is enabled by pressing the spacebar.
 * Releasing the spacebar will exit pan mode.
 * When in pan mode, the user can click and drag to pan the canvas.
 */
export function panInteraction({
  pan,
  enablePanMode,
  maybePan,
  startPanning,
  updatePanning,
  reset,
}: PanActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers
  >({
    none: (interactionState, api) => ({
      onWheel: (event) => {
        const delta = wheelValues(event.nativeEvent);

        pan(delta);
      },
      onKeyDown: api.handleKeyboardEvent({
        Space: () => enablePanMode(),
      }),
    }),
    panMode: (interactionState, api) => ({
      onPointerDown: (event) => {
        maybePan(api.getScreenPoint(event.nativeEvent));

        api.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      },
      onKeyUp: reset,
    }),
    maybePan: (interactionState, api) => ({
      onPointerMove: (event) => {
        startPanning(api.getScreenPoint(event.nativeEvent));

        event.preventDefault();
      },
      onPointerUp: (event) => {
        enablePanMode();

        api.releasePointerCapture?.(event.pointerId);

        event.preventDefault();
      },
      onKeyUp: reset,
    }),
    panning: (interactionState, api) => ({
      onPointerMove: (event) => {
        updatePanning(api.getScreenPoint(event.nativeEvent));

        event.preventDefault();
      },
      onPointerUp: (event) => {
        enablePanMode();

        api.releasePointerCapture?.(event.pointerId);

        event.preventDefault();
      },
      onKeyUp: reset,
    }),
  });
}

// MIT https://github.com/pmndrs/use-gesture

// wheel delta defaults from https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

function wheelValues(event: WheelEvent): Point {
  let { deltaX, deltaY, deltaMode } = event;
  // normalize wheel values, especially for Firefox
  if (deltaMode === 1) {
    deltaX *= LINE_HEIGHT;
    deltaY *= LINE_HEIGHT;
  } else if (deltaMode === 2) {
    deltaX *= PAGE_HEIGHT;
    deltaY *= PAGE_HEIGHT;
  }
  return { x: deltaX, y: deltaY };
}
