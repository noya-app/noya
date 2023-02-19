import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { heroSymbolV2 } from './symbols';

export const HeroBlockV2: BlockDefinition = {
  editorVersion: 2,
  symbol: heroSymbolV2,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === heroSymbolV2.symbolID)
    ) {
      return 0;
    }

    return Math.max(
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
  render: (props) => renderStack({ props, block: HeroBlockV2 }),
};
