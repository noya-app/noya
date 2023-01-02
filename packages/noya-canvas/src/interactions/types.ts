import { Point, Rect } from 'noya-geometry';
import { OffsetPoint } from 'noya-react-utils';
import { LayerTraversalOptions } from 'noya-state';
import { ICanvasElement } from '../components/types';

export type InteractionAPI = Partial<ICanvasElement> & {
  getRawPoint: (input: OffsetPoint) => Point;
  modKey: 'ctrlKey' | 'metaKey';
  selectedLayerIds: string[];
  getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => string[];
  getLayerIdAtPoint: (
    point: Point,
    options?: LayerTraversalOptions,
  ) => string | undefined;
};
