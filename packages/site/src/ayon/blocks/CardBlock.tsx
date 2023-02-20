import { BlockDefinition, Layers } from 'noya-state';
import { parseBlock } from '../parse';
import { BoxBlock } from './BoxBlock';
import { renderStack } from './render';
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
  render: (props) => renderStack({ props, block: CardBlock }),
};
