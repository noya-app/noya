import Sketch from 'noya-file-format';
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
  getTextAlign,
  mergeBlockItems,
  parseBlock,
  ParsedBlockItemParameters,
} from '../parse';
import { boxSymbol } from './symbols';

interface BlockRenderOptions {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText' | 'isPassthrough'>;
  overrideValues?: Sketch.OverrideValue[];
  extraParameters?: ParsedBlockItemParameters;
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
  overrideValues = [],
}: BlockRenderOptions): BlockProps[] {
  const master = applyOverrides({
    overrideValues,
    symbolMaster: block.symbol,
  });

  return zip(master.layers, block.symbol.layers).flatMap(
    ([layer, fallbackLayer]) => {
      if (
        !Layers.isSymbolInstance(layer) ||
        !Layers.isSymbolInstance(fallbackLayer) ||
        layer.isVisible === false
      ) {
        return [];
      }

      const override = overrideValues.find(
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

export function getRenderableBlockProps({
  props,
  block,
  overrideValues,
  extraParameters: inputExtraParameters,
}: BlockRenderOptions) {
  const container = getContainerBlockProps({ props, block });

  const { parameters } = parseBlock(container.blockText, 'regular');
  const hashtags = Object.keys(parameters);

  const background = Object.keys(parameters)
    .reverse()
    .find((key) => key.startsWith('bg-'));

  const darkBackground = background
    ? /-(500|600|700|800|900)$/.test(background)
    : undefined;

  const textAlign = getTextAlign(hashtags);

  const extraParameters = inputExtraParameters ?? {
    ...(textAlign && { [textAlign]: true }),
    ...((parameters.dark || darkBackground) && {
      'text-white': true,
      light: true,
    }),
  };

  const children = getChildrenBlockProps({
    props,
    block,
    overrideValues: props.layer?.overrideValues ?? overrideValues,
    extraParameters,
  });

  return { container, children, extraParameters };
}

export const renderStack = ({
  props,
  block,
  overrideValues,
  extraParameters: inputExtraParameters,
}: BlockRenderOptions) => {
  const {
    container,
    children,
    extraParameters: outputExtraParameters,
  } = getRenderableBlockProps({
    props,
    block,
    overrideValues,
    extraParameters: inputExtraParameters,
  });

  container.children = children.map((childProps) => {
    const block = props.getBlock(childProps.symbolId);

    if (block.isPassthrough) {
      return renderStack({
        props: childProps,
        block,
        overrideValues: props.layer?.overrideValues,
        extraParameters: outputExtraParameters,
      });
    }

    return block.render(childProps);
  });

  // We don't render empty passthrough blocks
  if (
    block.isPassthrough &&
    Array.isArray(container.children) &&
    container.children.length === 0
  ) {
    return null;
  }

  return props.getBlock(boxSymbol.symbolID).render(container);
};
