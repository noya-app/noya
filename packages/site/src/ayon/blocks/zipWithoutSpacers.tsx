import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { ParsedBlockItem } from '../parse';
import { spacerSymbolId } from './symbolIds';

export function layersWithoutSpacers(
  symbolMaster: Sketch.SymbolMaster,
): Sketch.SymbolInstance[] {
  return symbolMaster.layers.filter(
    (layer): layer is Sketch.SymbolInstance =>
      Layers.isSymbolInstance(layer) && layer.symbolID !== spacerSymbolId,
  );
}

export function zipWithoutSpacers(
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
