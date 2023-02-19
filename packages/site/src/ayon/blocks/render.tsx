import {
  applyOverrides,
  BlockDefinition,
  BlockProps,
  Layers,
  Overrides,
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

      const override = props.layer?.overrideValues.find(
        (override) =>
          override.overrideName ===
          Overrides.encodeName([layer.do_objectID], 'blockText'),
      );
      const hasOverride = !!(override && override.value);

      const fallback = parseBlock(fallbackLayer.blockText, 'regular');
      const item = parseBlock(layer?.blockText, 'regular');
      const merged = mergeBlockItems([
        ...(!hasOverride && extraParameters
          ? [{ content: '', parameters: extraParameters }]
          : []),
        item,
        ...(hasOverride && extraParameters
          ? [{ content: '', parameters: extraParameters }]
          : []),
        fallback,
      ]);

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

export function getRenderableBlockProps({ props, block }: BlockRenderOptions) {
  const container = getContainerBlockProps({ props, block });

  const { parameters } = parseBlock(container.blockText, 'regular');

  const background = Object.keys(parameters)
    .reverse()
    .find((key) => key.startsWith('bg-'));

  const darkBackground = background
    ? /-(500|600|700|800|900)$/.test(background)
    : undefined;

  const children = getChildrenBlockProps({
    props,
    block,
    extraParameters: {
      ...(parameters.left && { left: true }),
      ...(parameters.right && { right: true }),
      ...(parameters.center && { center: true }),
      ...((parameters.dark || darkBackground) && {
        'text-white': true,
        light: true,
      }),
    },
  });

  return { container, children };
}

export const renderStack = ({ props, block }: BlockRenderOptions) => {
  const { container, children } = getRenderableBlockProps({ props, block });

  container.children = children.map((childProps) =>
    props.getBlock(childProps.symbolId).render(childProps),
  );

  return props.getBlock(boxSymbol.symbolID).render(container);
};
