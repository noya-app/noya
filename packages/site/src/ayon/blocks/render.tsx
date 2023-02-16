import {
  applyOverrides,
  BlockDefinition,
  BlockProps,
  Layers,
} from 'noya-state';
import { encodeBlockItem, mergeBlock, parseBlock } from '../parse';
import { boxSymbol } from './symbols';

interface BlockRenderOptions {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText'>;
}

export function getContainerBlockProps({
  props,
  block,
}: BlockRenderOptions): BlockProps {
  const fallback = parseBlock(block.symbol.defaultBlockText, 'regular');

  return {
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbol.symbolID,
    dataSet: props.dataSet,
    blockText: encodeBlockItem(
      mergeBlock({
        block: {
          content: props.layer?.blockText ?? '',
          parameters: {},
        },
        fallback,
      }),
    ),
  };
}

export function getChildrenBlockProps({
  props,
  block,
}: BlockRenderOptions): BlockProps[] {
  if (!props.layer) return [];

  const master = applyOverrides({
    overrideValues: props.layer.overrideValues,
    symbolMaster: block.symbol,
  });

  return master.layers.flatMap((layer) => {
    if (!Layers.isSymbolInstance(layer)) return [];

    return [
      {
        getBlock: props.getBlock,
        symbolId: layer.symbolID,
        blockText: layer.blockText,
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
