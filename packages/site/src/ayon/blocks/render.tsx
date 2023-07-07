import {
  applyOverrides,
  BlockDefinition,
  BlockProps,
  BlockRenderingEnvironment,
  Layers,
  Overrides,
} from 'noya-state';
import { zip } from 'noya-utils';
import { spacerSymbolId } from '../symbols/symbolIds';
import { boxSymbol } from '../symbols/symbols';
import { getTextAlign } from '../tailwind/tailwind';
import { getParameters } from '../utils/getMappedParameters';

interface BlockRenderOptions {
  props: BlockProps;
  block: Pick<BlockDefinition, 'symbol' | 'placeholderText' | 'isPassthrough'>;
  extraParameters?: Record<string, boolean>;
}

export function getContainerBlockProps({
  props,
  block,
}: BlockRenderOptions): BlockProps {
  const fallback = block.symbol.defaultBlockText;
  const item = props.layer?.blockText;
  const blockText = item ?? fallback;

  return {
    frame: props.frame,
    getBlock: props.getBlock,
    symbolId: boxSymbol.symbolID,
    dataSet: props.dataSet,
    resolvedBlockData: props.resolvedBlockData,
    blockText,
    layer: props.layer,
    overrideValues: props.overrideValues,
  };
}

function getChildrenBlockProps({
  props,
  block,
  extraParameters,
}: BlockRenderOptions): BlockProps[] {
  const overrideValues = props.overrideValues ?? [];

  const master = applyOverrides({
    overrideValues,
    symbolMaster: block.symbol,
  });

  return zip(master.layers, block.symbol.layers).flatMap(
    ([layer, fallbackLayer]): BlockProps[] => {
      if (
        !Layers.isSymbolInstance(layer) ||
        !Layers.isSymbolInstance(fallbackLayer) ||
        layer.isVisible === false
      ) {
        return [];
      }

      const override = overrideValues.find((override) => {
        return (
          override.overrideName ===
          Overrides.encodeName([layer.do_objectID], 'blockText')
        );
      });
      // const hasOverride = !!(override && override.value);

      const fallback = fallbackLayer.blockText;
      const item = layer?.blockText;
      // const merged = mergeBlockItems([
      //   ...(!hasOverride && extraParameters
      //     ? [{ content: '', parameters: extraParameters }]
      //     : []),
      //   item,
      //   ...(hasOverride && extraParameters
      //     ? [{ content: '', parameters: extraParameters }]
      //     : []),
      //   fallback,
      // ]);
      // const blockText = encodeBlockItem(merged);
      const blockText =
        (override?.value as string | undefined) ?? item ?? fallback;

      return [
        {
          getBlock: props.getBlock,
          symbolId: layer.symbolID,
          blockText,
          resolvedBlockData:
            layer.resolvedBlockData ?? fallbackLayer.resolvedBlockData,
          overrideValues: [
            ...layer.overrideValues,
            ...Overrides.removePrefix(overrideValues, layer.do_objectID),
          ],
          layer,
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
  extraParameters: inputExtraParameters,
}: BlockRenderOptions) {
  const container = getContainerBlockProps({ props, block });

  const parameters = getParameters(container.blockParameters);
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
    extraParameters,
  });

  return { container, children, extraParameters };
}

export const renderStack = (
  env: BlockRenderingEnvironment,
  { props, block, extraParameters: inputExtraParameters }: BlockRenderOptions,
) => {
  const {
    container,
    children,
    extraParameters: outputExtraParameters,
  } = getRenderableBlockProps({
    props,
    block,
    extraParameters: inputExtraParameters,
  });

  container.children = children.map((childProps) => {
    const block = props.getBlock(childProps.symbolId);

    if (block.isPassthrough && block.symbol.symbolID !== spacerSymbolId) {
      return renderStack(env, {
        props: childProps,
        block,
        extraParameters: outputExtraParameters,
      });
    }

    return block.render(env, childProps);
  });

  if (block.symbol.symbolID === spacerSymbolId) {
    return props.getBlock(spacerSymbolId).render(env, container);
  }

  // We don't render empty passthrough blocks
  if (
    block.isPassthrough &&
    Array.isArray(container.children) &&
    container.children.length === 0
  ) {
    return null as unknown as JSX.Element;
  }

  return props.getBlock(boxSymbol.symbolID).render(env, container);
};
