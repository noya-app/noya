import { BlockDefinition } from 'noya-state';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
import { isWithinRectRange } from './score';
import { heroSymbolV2, heroWithImageSymbol } from './symbols';

export const HeroBlockV2: BlockDefinition = {
  editorVersion: 2,
  symbol: heroSymbolV2,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find((block) => block.symbolId === heroSymbolV2.symbolID)
    ) {
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
  editorVersion: 2,
  symbol: heroWithImageSymbol,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
  isComposedBlock: true,
  infer: ({ frame, blockText, siblingBlocks }) => 0,
  render: (env, props) =>
    renderStack(env, { props, block: HeroWithImageBlock }),
};
