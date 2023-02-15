import { BlockDefinition, BlockProps, Layers } from 'noya-state';
import { encodeBlockItem, mergeBlock, parseBlock } from '../parse';
import { boxSymbol } from './symbols';
import { zipWithoutSpacers } from './zipWithoutSpacers';

interface BlockRenderOptions {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText'>;
}

export function getContainerBlockProps({
  props,
  block,
}: {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText'>;
}): BlockProps {
  const { symbol, placeholderText } = block;

  const {
    parameters: { dark },
  } = parseBlock(props.blockText, 'newlineSeparated', {
    placeholder: placeholderText,
  });

  const fallback = parseBlock(symbol.defaultBlockText, 'regular');

  return {
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbol.symbolID,
    ...(props.dataSet && {
      dataSet: props.dataSet,
    }),
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
  };
}

export function getChildrenBlockProps({
  props,
  block,
}: {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText'>;
}): BlockProps[] {
  const { symbol, placeholderText } = block;

  const {
    items,
    parameters: { dark },
  } = parseBlock(props.blockText, 'newlineSeparated', {
    placeholder: placeholderText,
  });

  return zipWithoutSpacers(symbol.layers, items).flatMap(([layer, item]) => {
    if (!Layers.isSymbolInstance(layer)) return [];

    const Block = props.getBlock(layer.symbolID);

    const fallback = parseBlock(layer.blockText, Block.parser);

    if (dark && Block.hashtags?.includes('text-white')) {
      fallback.parameters['text-white'] = true;
    }

    const merged = mergeBlock({ fallback, block: item });

    return [
      {
        getBlock: props.getBlock,
        symbolId: layer.symbolID,
        blockText: encodeBlockItem(merged),
        ...(props.dataSet && {
          dataSet: {
            id: layer.do_objectID,
            parentId: props.dataSet.parentId,
          },
        }),
      },
    ];
  });
}

export const renderNewlineSeparated = ({
  props,
  block,
}: BlockRenderOptions) => {
  const children = getChildrenBlockProps({ props, block });

  const containerBlockProps = getContainerBlockProps({ props, block });

  containerBlockProps.children = children.map((childProps) =>
    props.getBlock(childProps.symbolId).render(childProps),
  );

  return props.getBlock(boxSymbol.symbolID).render(containerBlockProps);
};
