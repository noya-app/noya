import { NoyaAPI } from 'noya-api';
import { DrawableLayerType } from 'noya-state';
import { NoyaGeneratorProp, NoyaNode } from '../dseditor/types';

export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};

export type ViewType = 'combined' | 'previewOnly';

export type LayoutGenerationSource = {
  name: string;
  description: string;
};

export type PreferredImageGenerator = Exclude<
  NoyaGeneratorProp['generator'],
  'random-icon'
>;

export type CustomLayerData = {
  description?: string;
  node?: NoyaNode;
  activeGenerationIndex?: number;
  layoutGenerationSource?: LayoutGenerationSource;
  preferredImageGenerator?: NoyaAPI.ImageGenerator;
  suggestedNames?: string[];
};

export type NodePath = { path: string[]; layerId: string };
