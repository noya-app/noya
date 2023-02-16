import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides } from 'noya-state';
import { zip } from 'noya-utils';
import { Descendant, Node } from 'slate';
import { Blocks } from '../blocks';
import { layersWithoutSpacers } from '../blocks/zipWithoutSpacers';
import { ParagraphElement } from './types';

export function toContent(
  symbol: Sketch.SymbolMaster,
  value: Descendant[],
): BlockContent {
  const last = value[value.length - 1];
  const rest = value.slice(0, -1);

  const layers = layersWithoutSpacers(symbol);

  const overrides = zip(layers, rest).map(
    ([layer, node]): Sketch.OverrideValue => {
      const key = Overrides.encodeName([layer.do_objectID], 'blockText');
      const value = Node.string(node);

      return SketchModel.overrideValue({
        overrideName: key,
        value,
      });
    },
  );

  return {
    blockText: Node.string(last),
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
    };
  });

  const rootNode: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: instance.blockText ?? '' }],
  };

  return [...layerNodes, rootNode];
}

export function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}
