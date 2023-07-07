import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { heroWithImageSymbolId } from './symbolIds';
import { heroSymbolV2, heroWithImageSymbol } from './symbols';

const heroSymbolIds = [heroSymbolV2.symbolID, heroWithImageSymbolId];

export const HeroBlockV2: BlockDefinition = {
  symbol: heroSymbolV2,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.some((block) => heroSymbolIds.includes(block.symbolId))) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 400,
        minHeight: 200,
        maxWidth: 2000,
        maxHeight: 550,
      }) && frame.y < 180
        ? 1
        : 0,
      0.1,
    );
  },
  render: (env, props) => renderStack(env, { props, block: HeroBlockV2 }),
};

export const HeroWithImageBlock: BlockDefinition = {
  symbol: heroWithImageSymbol,
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.some((block) => heroSymbolIds.includes(block.symbolId))) {
      return 0;
    }

    return Math.max(
      isWithinRectRange({
        rect: frame,
        minWidth: 1000,
        minHeight: 400,
        maxWidth: 2000,
        maxHeight: 800,
      }) && frame.y < 180
        ? 1.2
        : 0,
      0.1,
    );
  },
  render: (env, props) =>
    renderStack(env, { props, block: HeroWithImageBlock }),
};
