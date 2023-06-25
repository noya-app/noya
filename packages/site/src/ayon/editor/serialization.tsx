import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides } from 'noya-state';
import { Descendant, Node } from 'slate';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { ParagraphElement } from './types';

export type EditorBlockContent = Omit<
  Required<BlockContent>,
  'normalizedText'
> & {
  layerPath: string[];
};

export function toContent(
  symbol: Sketch.SymbolMaster,
  nodes: Descendant[],
): EditorBlockContent {
  const layers = flattenPassthroughLayers(symbol);
  const overrides: Sketch.OverrideValue[] = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const node = nodes[i + 1];
    const value = node ? Node.string(node) : '';

    overrides.push(
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName([layer.do_objectID], 'blockText'),
        value,
      }),
    );
  }

  const rootNode = nodes[0] as ParagraphElement;

  return {
    symbolId: symbol.symbolID,
    blockText: nodes.length > layers.length ? Node.string(rootNode) : '',
    overrides: overrides,
    layerPath: [],
  };
}

export function extractBlockContent(
  instance: Sketch.SymbolInstance,
): EditorBlockContent {
  return {
    blockText: instance.blockText ?? '',
    overrides: instance.overrideValues,
    symbolId: instance.symbolID,
    layerPath: [],
  };
}

export function fromContent(
  symbol: Sketch.SymbolMaster,
  content: EditorBlockContent,
): Descendant[] {
  const layers = flattenPassthroughLayers(symbol);

  const layerNodes = layers.map((layer): ParagraphElement => {
    const value = Overrides.getOverrideValue(
      content.overrides ?? [],
      layer.do_objectID,
      'blockText',
    );

    return {
      type: 'paragraph',
      children: [{ text: value ?? '' }],
      symbolId: layer.symbolID,
      layerPath: [layer.do_objectID],
      isRoot: false,
    };
  });

  const rootNode: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: content.blockText ?? '' }],
    symbolId: content.symbolId,
    layerPath: [],
    isRoot: true,
  };

  return [rootNode, ...layerNodes];
}

export function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}
