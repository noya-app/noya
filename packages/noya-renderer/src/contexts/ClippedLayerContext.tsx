import { createContext, useContextSelector } from 'use-context-selector';

type ClippedLayerMap = Record<string, boolean>;

/**
 * A context containing the ids of layers outside the visible area of the canvas.
 *
 * A layer must be explicitly marked clipped with `true`, otherwise it will be visible.
 * This is to make it easier to work with layers that are created ad-hoc, e.g. in symbols,
 * where we don't know the id ahead of time.
 */
const ClippedLayerContext = createContext<ClippedLayerMap>({});

export function useIsLayerClipped(layerId: string): boolean {
  return useContextSelector(
    ClippedLayerContext,
    (layerIsClipped) => layerIsClipped[layerId] ?? false,
  );
}

export const ClippedLayerProvider = ClippedLayerContext.Provider;
