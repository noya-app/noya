import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { Blocks } from './blocks';

export function flattenPassthroughLayers(
  symbolMaster: Sketch.SymbolMaster,
): Sketch.SymbolInstance[] {
  return symbolMaster.layers
    .filter(Layers.isSymbolInstance)
    .flatMap((layer) => {
      const block = Blocks[layer.symbolID];

      if (block && block.isPassthrough) {
        return flattenPassthroughLayers(block.symbol);
      }

      return layer;
    });
}
