import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides } from 'noya-state';
import { Descendant, Node } from 'slate';
import { Blocks } from '../blocks/blocks';
import { layersWithoutSpacers } from '../blocks/zipWithoutSpacers';
import { ParagraphElement } from './types';

export function toContent(
  symbol: Sketch.SymbolMaster,
  nodes: Descendant[],
): BlockContent {
  const layers = layersWithoutSpacers(symbol);
  const overrides: Sketch.OverrideValue[] = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const key = Overrides.encodeName([layer.do_objectID], 'blockText');
    const value = nodes[i] ? Node.string(nodes[i]) : '';

    overrides.push(
      SketchModel.overrideValue({
        overrideName: key,
        value,
      }),
    );
  }

  return {
    blockText:
      nodes.length > layers.length ? Node.string(nodes[layers.length]) : '',
    overrides: overrides,
  };
}

export function fromSymbol(
  symbol: Sketch.SymbolMaster,
  instance: Sketch.SymbolInstance,
): Descendant[] {
  const layers = layersWithoutSpacers(symbol);

  const layerNodes = layers.map((layer): ParagraphElement => {
    const block = layer ? Blocks[layer.symbolID] : undefined;
    const name = block ? block.symbol.name : undefined;

    const value = Overrides.getOverrideValue(
      instance.overrideValues,
      layer.do_objectID,
      'blockText',
    );

    return {
      type: 'paragraph',
      children: [{ text: value ?? '' }],
      label: name,
      symbolId: layer.symbolID,
      placeholder: layer.blockText,
    };
  });

  const rootNode: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: instance.blockText ?? '' }],
    symbolId: instance.symbolID,
    placeholder: undefined,
  };

  return [...layerNodes, rootNode];
}

export function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}
