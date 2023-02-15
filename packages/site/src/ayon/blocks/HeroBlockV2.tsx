import Sketch from 'noya-file-format';
import { BlockDefinition, Layers } from 'noya-state';
import { encodeBlockItem, parseBlock, ParsedBlockItem } from '../parse';
import { isWithinRectRange } from './score';
import {
  boxSymbolId,
  buttonSymbolId,
  heroSymbol,
  heroSymbolV2,
  heroSymbolV2Id,
  spacerSymbolId,
} from './symbols';

const placeholderText = `
Create, iterate, inspire.
Turn great ideas into new possibilities.
Get started
`.trim();

const parser = 'newlineSeparated';

function zipWithoutSpacers(
  layers: Sketch.AnyLayer[],
  items: ParsedBlockItem[],
) {
  let pairs: [Sketch.AnyLayer, ParsedBlockItem][] = [];

  let layersIndex = 0;
  let itemsIndex = 0;

  while (layersIndex < layers.length && itemsIndex < items.length) {
    const layer = layers[layersIndex];
    const item = items[itemsIndex];

    if (!Layers.isSymbolInstance(layer)) continue;

    if (layer.symbolID === spacerSymbolId) {
      pairs.push([
        layer,
        {
          content: '',
          parameters: {},
        },
      ]);
      layersIndex++;
      continue;
    }

    pairs.push([layer, item]);

    itemsIndex++;
    layersIndex++;
  }

  return pairs;
}

export const HeroBlockV2: BlockDefinition = {
  id: heroSymbolV2Id,
  parser,
  hashtags: ['dark'],
  placeholderText,
  infer: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === heroSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
  render: (props) => {
    const {
      items,
      parameters: { dark },
    } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const children = zipWithoutSpacers(heroSymbolV2.layers, items).map(
      ([layer, item]) => {
        if (!Layers.isSymbolInstance(layer)) return null;

        const Block = props.getBlock(layer.symbolID);

        const parameters =
          layer.symbolID === spacerSymbolId
            ? { ...item.parameters, 'basis-0': true }
            : layer.symbolID === buttonSymbolId
            ? { ...item.parameters, primary: true, md: true }
            : { ...item.parameters, ...(dark && { 'text-white': true }) };

        return Block.render({
          getBlock: props.getBlock,
          symbolId: layer.symbolID,
          blockText: encodeBlockItem({ ...item, parameters }),
        });
      },
    );

    const container = props.getBlock(boxSymbolId).render({
      frame: props.frame,
      getBlock: props.getBlock,
      symbolId: boxSymbolId,
      blockText: encodeBlockItem({
        content: '',
        parameters: {
          'flex-col': true,
          'items-center': true,
          'justify-center': true,
          'text-center': true,
          'bg-transparent': true,
          'p-4': true,
          'gap-3': true,
          ...(dark && { 'bg-gray-900': true }),
        },
      }),
      children,
    });

    return container;
  },
};
