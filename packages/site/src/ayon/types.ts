import { Rect } from 'noya-geometry';
import { DrawableLayerType } from 'noya-state';

export type BlockHeuristicInput = { rect: Rect; text?: string };
export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};
