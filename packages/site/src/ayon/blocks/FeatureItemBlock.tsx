import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { featureItemSymbol } from './symbols';

export const FeatureItemBlock: BlockDefinition = {
  symbol: featureItemSymbol,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 200,
        maxWidth: 600,
        minHeight: 150,
        maxHeight: 300,
      }) && frame.width > frame.height
        ? 0.5
        : 0,
      0,
    );
  },
  render: (env, props) => renderStack(env, { props, block: FeatureItemBlock }),
};
