import {
  applyOverrides,
  BlockDefinition,
  BlockProps,
  Layers,
} from 'noya-state';
import { zip } from 'noya-utils';
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
  const item = parseBlock(props.layer?.blockText, 'regular');
  const blockText = encodeBlockItem(mergeBlock({ block: item, fallback }));

  return {
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbol.symbolID,
    dataSet: props.dataSet,
    blockText,
    resolvedBlockData: props.resolvedBlockData,
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

  return zip(master.layers, block.symbol.layers).flatMap(
    ([layer, fallbackLayer]) => {
      if (
        !Layers.isSymbolInstance(layer) ||
        !Layers.isSymbolInstance(fallbackLayer)
      ) {
        return [];
      }

      const fallback = parseBlock(fallbackLayer.blockText, 'regular');
      const item = parseBlock(layer?.blockText, 'regular');
      const blockText = encodeBlockItem(mergeBlock({ block: item, fallback }));

      return [
        {
          getBlock: props.getBlock,
          symbolId: layer.symbolID,
          blockText,
          resolvedBlockData:
            layer.resolvedBlockData ?? fallbackLayer.resolvedBlockData,
          ...(props.dataSet && {
            dataSet: {
              id: layer.do_objectID,
              parentId: props.dataSet.parentId,
            },
          }),
        },
      ];
    },
  );
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
