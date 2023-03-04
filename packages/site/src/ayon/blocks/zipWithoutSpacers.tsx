import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { Blocks } from './blocks';
import { spacerSymbolId } from './symbolIds';

export function layersWithoutSpacers(
  symbolMaster: Sketch.SymbolMaster,
): Sketch.SymbolInstance[] {
  return symbolMaster.layers
    .filter(Layers.isSymbolInstance)
    .filter((layer) => layer.symbolID !== spacerSymbolId)
    .flatMap((layer) => {
      const block = Blocks[layer.symbolID];

      if (block && block.isPassthrough) {
        return layersWithoutSpacers(block.symbol);
      }

      return layer;
    });
}
