import { createContext, useContextSelector } from 'use-context-selector';

type VisibleLayerMap = Record<string, boolean>;

/**
 * A context containing the ids of layers in the visible areas of the canvas.
 *
 * A layer must be explicitly hidden with `false`, otherwise it will be visible.
 * This is to make it easier to work with layers that are created ad-hoc, e.g. in symbols,
 * where we don't know the id ahead of time.
 */
const VisibleLayerContext = createContext<VisibleLayerMap>({});

export function useIsLayerVisible(layerId: string): boolean {
  return useContextSelector(VisibleLayerContext, (state) =>
    state ? state[layerId] ?? true : true,
  );
}

export const VisibleLayerProvider = VisibleLayerContext.Provider;
