import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { featureSectionSymbol } from './symbols';

export const FeatureSectionBlock: BlockDefinition = {
  editorVersion: 2,
  symbol: featureSectionSymbol,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => 0,
  render(env, props) {
    return renderStack(env, { props, block: this });
  },
};