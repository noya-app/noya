import { DrawableLayerType } from 'noya-state';
import { NoyaNode } from '../dseditor/types';

export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};

export type ViewType = 'combined' | 'previewOnly';

export type CustomLayerData = {
  description?: string;
  node?: NoyaNode;
};
