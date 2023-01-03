import { Point, Rect } from 'noya-geometry';
import { KeyMap, PlatformName } from 'noya-keymap';
import { OffsetPoint } from 'noya-react-utils';
import { LayerTraversalOptions, SelectedGradient } from 'noya-state';
import React from 'react';
import { ICanvasElement } from '../components/types';

export type InteractionAPI = Partial<ICanvasElement> & {
  platform: PlatformName;
  platformModKey: 'ctrlKey' | 'metaKey';
  selectedLayerIds: string[];
  selectedGradient?: SelectedGradient;
  zoomValue: number;
  convertPoint: (point: Point, to: 'screen' | 'canvas') => Point;
  getScreenPoint: (input: OffsetPoint) => Point;
  getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => string[];
  getLayerIdAtPoint: (
    point: Point,
    options?: LayerTraversalOptions,
  ) => string | undefined;
  handleKeyboardEvent: (keyMap: KeyMap) => (event: React.KeyboardEvent) => void;
};
