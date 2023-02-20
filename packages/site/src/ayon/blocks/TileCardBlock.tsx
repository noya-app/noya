import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { tileCardSymbol } from './symbols';

export const TileCardBlock: BlockDefinition = {
  editorVersion: 2,
  symbol: tileCardSymbol,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
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
  render: (props) => renderStack({ props, block: TileCardBlock }),
};
