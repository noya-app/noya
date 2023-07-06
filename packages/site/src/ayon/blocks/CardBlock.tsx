import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { cardSymbol } from './symbols';

export const CardBlock: BlockDefinition = {
  editorVersion: 2,
  symbol: cardSymbol,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 200,
        minHeight: 250,
        maxWidth: 300,
        maxHeight: 400,
      })
        ? 1
        : 0,
      0.1,
    );
  },
  render: (env, props) => renderStack(env, { props, block: CardBlock }),
};
