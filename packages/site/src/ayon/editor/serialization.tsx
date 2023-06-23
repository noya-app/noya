import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides } from 'noya-state';
import { Descendant, Node } from 'slate';
import { Blocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { ParagraphElement } from './types';

type SerializedBlockContent = Omit<Required<BlockContent>, 'normalizedText'>;

export function toContent(
  symbol: Sketch.SymbolMaster,
  nodes: Descendant[],
): SerializedBlockContent {
  const layers = flattenPassthroughLayers(symbol);
  const overrides: Sketch.OverrideValue[] = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const value = nodes[i] ? Node.string(nodes[i]) : '';

    if (value) {
      overrides.push(
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName([layer.do_objectID], 'blockText'),
          value,
        }),
      );
    }
  }

  return {
    symbolId: symbol.symbolID,
    blockText:
      nodes.length > layers.length ? Node.string(nodes[layers.length]) : '',
    overrides: overrides,
  };
}

export function extractBlockContent(
  instance: Sketch.SymbolInstance,
): SerializedBlockContent {
  return {
    blockText: instance.blockText ?? '',
    overrides: instance.overrideValues,
    symbolId: instance.symbolID,
  };
}

export function fromSymbol(
  symbol: Sketch.SymbolMaster,
  instance: SerializedBlockContent,
): Descendant[] {
  const layers = flattenPassthroughLayers(symbol);

  const layerNodes = layers.map((layer): ParagraphElement => {
    const block = layer ? Blocks[layer.symbolID] : undefined;
    const name = block ? block.symbol.name : undefined;

    const value = Overrides.getOverrideValue(
      instance.overrides ?? [],
      layer.do_objectID,
      'blockText',
    );

    return {
      type: 'paragraph',
      children: [{ text: value ?? '' }],
      label: name,
      symbolId: layer.symbolID,
      placeholder: layer.blockText,
      layerId: layer.do_objectID,
    };
  });

  const rootNode: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: instance.blockText ?? '' }],
    symbolId: instance.symbolId,
    placeholder: undefined,
    layerId: undefined,
  };

  return [...layerNodes, rootNode];
}

export function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}
