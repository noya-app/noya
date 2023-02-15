import { BlockDefinition, BlockProps, Layers } from 'noya-state';
import { encodeBlockItem, mergeBlock, parseBlock } from '../parse';
import { boxSymbolId } from './symbolIds';
import { zipWithoutSpacers } from './zipWithoutSpacers';

export const renderNewlineSeparated = ({
  props,
  block,
}: {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText'>;
}) => {
  const { symbol, placeholderText } = block;

  const {
    items,
    parameters: { dark },
  } = parseBlock(props.blockText, 'newlineSeparated', {
    placeholder: placeholderText,
  });

  const children = zipWithoutSpacers(symbol.layers, items).map(
    ([layer, item]) => {
      if (!Layers.isSymbolInstance(layer)) return null;

      const Block = props.getBlock(layer.symbolID);

      const fallback = parseBlock(layer.blockText, Block.parser);

      if (dark && Block.hashtags?.includes('text-white')) {
        fallback.parameters['text-white'] = true;
      }

      const merged = mergeBlock({ fallback, block: item });

      return Block.render({
        getBlock: props.getBlock,
        symbolId: layer.symbolID,
        blockText: encodeBlockItem(merged),
      });
    },
  );

  const fallback = parseBlock(symbol.defaultBlockText, 'regular');

  const container = props.getBlock(boxSymbolId).render({
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbolId,
    blockText: encodeBlockItem(
      mergeBlock({
        block: {
          content: '',
          parameters: {
            ...(dark && { 'bg-gray-900': true }),
          },
        },
        fallback,
      }),
    ),
    children,
  });

  return container;
};
