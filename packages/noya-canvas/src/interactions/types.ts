import { Point, Rect } from 'noya-geometry';
import { OffsetPoint } from 'noya-react-utils';
import { LayerTraversalOptions } from 'noya-state';
import { RefObject } from 'react';

export type InteractionAPI = {
  getRawPoint: (input: OffsetPoint) => Point;
  containerRef: RefObject<HTMLElement>;
  modKey: 'ctrlKey' | 'metaKey';
  selectedLayerIds: string[];
  getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => string[];
  getLayerIdAtPoint: (
    point: Point,
    options?: LayerTraversalOptions,
  ) => string | undefined;
};
