import { Point, Rect } from 'noya-geometry';
import { KeyMap, PlatformName } from 'noya-keymap';
import { OffsetPoint } from 'noya-react-utils';
import {
  CharacterSelectionMode,
  CompassDirection,
  LayerTraversalOptions,
  LayerType,
  SelectedGradient,
  TextSelection,
} from 'noya-state';
import React from 'react';
import { ICanvasElement } from '../components/types';

export type InteractionAPI = Partial<ICanvasElement> & {
  platform: PlatformName;
  platformModKey: 'ctrlKey' | 'metaKey';
  selectedLayerIds: string[];
  highlightedLayerId?: string;
  selectedGradient?: SelectedGradient;
  textSelection?: TextSelection;
  zoomValue: number;
  getClickCount: () => number;
  convertPoint: (point: Point, to: 'screen' | 'canvas') => Point;
  getScreenPoint: (input: OffsetPoint) => Point;
  getLayerIdsInRect: (rect: Rect, options?: LayerTraversalOptions) => string[];
  getLayerIdAtPoint: (
    point: Point,
    options?: LayerTraversalOptions,
  ) => string | undefined;
  getLayerTypeById: (id: string) => LayerType;
  getScaleDirectionAtPoint: (point: Point) => CompassDirection | undefined;
  getCharacterIndexAtPoint: (
    layerId: string,
    point: Point,
    mode: CharacterSelectionMode,
  ) => number | undefined;
  getCharacterIndexAtPointInSelectedLayer: (
    point: Point,
    mode: CharacterSelectionMode,
  ) => number | undefined;
  getTextLength: (layerId: string) => number;
  handleKeyboardEvent: (keyMap: KeyMap) => (event: React.KeyboardEvent) => void;
};
