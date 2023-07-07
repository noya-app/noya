import { BlockDefinition } from 'noya-state';
import { isWithinRectRange } from '../infer/score';
import { BoxBlock } from './elements/BoxBlock';
import { renderStack } from './render';
import { tileCardSymbol } from './symbols';

export const TileCardBlock: BlockDefinition = {
  symbol: tileCardSymbol,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 200,
        minHeight: 200,
        maxWidth: 250,
        maxHeight: 250,
      })
        ? 1.2
        : 0,
      0.1,
    );
  },
  render: (env, props) => renderStack(env, { props, block: TileCardBlock }),
};
