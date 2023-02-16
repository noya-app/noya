import { BlockDefinition, Layers } from 'noya-state';
import { parseBlock } from '../parse';
import { BoxBlock } from './BoxBlock';
import { renderNewlineSeparated } from './render';
import { isWithinRectRange } from './score';
import { spacerSymbolId } from './symbolIds';
import { heroSymbolV2 } from './symbols';

const parser = 'newlineSeparated';

const placeholderText = heroSymbolV2.layers
  .flatMap((layer) => {
    if (!Layers.isSymbolInstance(layer)) return [];

    // Ignore spacers
    if (layer.symbolID === spacerSymbolId) return [];

    const fallback = parseBlock(layer.blockText, 'regular');

    return [fallback.content];
  })
  .join('\n');

export const HeroBlockV2: BlockDefinition = {
  symbol: heroSymbolV2,
  parser,
  hashtags: BoxBlock.hashtags,
  placeholderText,
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
  render: (props) => renderNewlineSeparated({ props, block: HeroBlockV2 }),
};
