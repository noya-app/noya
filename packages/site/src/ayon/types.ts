import { DrawableLayerType } from 'noya-state';

export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};

export type ViewType = 'split' | 'combined' | 'previewOnly';
