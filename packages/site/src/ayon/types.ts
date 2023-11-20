import { NoyaAPI } from 'noya-api';
import { NoyaGeneratorProp, NoyaNode } from 'noya-component';
import { DrawableLayerType } from 'noya-state';

export type InferredBlockTypeResult = {
  type: DrawableLayerType;
  score: number;
};

export type ViewType = 'editable' | 'readOnly' | 'preview';

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
