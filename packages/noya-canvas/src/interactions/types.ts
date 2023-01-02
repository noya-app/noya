import { Point, Rect } from 'noya-geometry';
import { OffsetPoint } from 'noya-react-utils';
import { LayerTraversalOptions } from 'noya-state';
import { ICanvasElement } from '../components/types';

export type InteractionAPI = Partial<ICanvasElement> & {
  modKey: 'ctrlKey' | 'metaKey';
  selectedLayerIds: string[];
  zoomValue: number;
  convertPoint: (point: Point, to: 'screen' | 'canvas') => Point;
  getScreenPoint: (input: OffsetPoint) => Point;
  getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => string[];
  getLayerIdAtPoint: (
    point: Point,
    options?: LayerTraversalOptions,
  ) => string | undefined;
};
