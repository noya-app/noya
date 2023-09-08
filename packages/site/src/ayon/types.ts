import { DrawableLayerType } from 'noya-state';
import { NoyaNode } from '../dseditor/types';

export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};

export type ViewType = 'combined' | 'previewOnly';

export type LayoutGenerationSource = {
  name: string;
  description: string;
};

export type CustomLayerData = {
  description?: string;
  node?: NoyaNode;
  activeGenerationIndex?: number;
  layoutGenerationSource?: LayoutGenerationSource;
};

export type NodePath = { path: string[]; layerId: string };
