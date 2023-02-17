import { BlockDefinition, Layers } from 'noya-state';
import { parseBlock } from '../parse';
import { BoxBlock } from './BoxBlock';
import { renderNewlineSeparated } from './render';
import { isWithinRectRange } from './score';
import { spacerSymbolId } from './symbolIds';
import { cardSymbol } from './symbols';

const placeholderText = cardSymbol.layers
  .flatMap((layer) => {
    if (!Layers.isSymbolInstance(layer)) return [];

    // Ignore spacers
    if (layer.symbolID === spacerSymbolId) return [];

    const fallback = parseBlock(layer.blockText, 'regular');

    return [fallback.content];
  })
  .join('\n');

export const CardBlock: BlockDefinition = {
  editorVersion: 2,
  symbol: cardSymbol,
  parser: 'regular',
  hashtags: BoxBlock.hashtags,
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === cardSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
  render: (props) => renderNewlineSeparated({ props, block: CardBlock }),
};
