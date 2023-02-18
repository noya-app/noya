import {
  applyOverrides,
  BlockDefinition,
  BlockProps,
  Layers,
} from 'noya-state';
import { zip } from 'noya-utils';
import {
  encodeBlockItem,
  mergeBlockItems,
  parseBlock,
  ParsedBlockItemParameters,
} from '../parse';
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
  const blockText = encodeBlockItem(mergeBlockItems([item, fallback]));

  return {
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbol.symbolID,
    dataSet: props.dataSet,
    resolvedBlockData: props.resolvedBlockData,
    blockText,
  };
}

export function getChildrenBlockProps({
  props,
  block,
  extraParameters,
}: BlockRenderOptions & {
  extraParameters?: ParsedBlockItemParameters;
}): BlockProps[] {
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
      const merged = mergeBlockItems([
        item,
        ...(extraParameters
          ? [{ content: '', parameters: extraParameters }]
          : []),
        fallback,
      ]);

      for (const [key, value] of Object.entries(extraParameters ?? {})) {
        if (
          key in merged.parameters ||
          !props.getBlock(layer.symbolID).hashtags?.includes(key)
        ) {
          continue;
        }

        merged.parameters[key] = value;
      }

      const blockText = encodeBlockItem(merged);

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

export const renderStack = ({ props, block }: BlockRenderOptions) => {
  const containerBlockProps = getContainerBlockProps({ props, block });

  const { parameters } = parseBlock(containerBlockProps.blockText, 'regular');

  const children = getChildrenBlockProps({
    props,
    block,
    extraParameters: {
      ...(parameters.left && { left: true }),
      ...(parameters.right && { right: true }),
      ...(parameters.center && { center: true }),
    },
  });

  containerBlockProps.children = children.map((childProps) =>
    props.getBlock(childProps.symbolId).render(childProps),
  );

  return props.getBlock(boxSymbol.symbolID).render(containerBlockProps);
};
