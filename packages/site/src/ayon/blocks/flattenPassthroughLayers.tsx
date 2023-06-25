import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { Blocks } from './blocks';

export function flattenPassthroughLayers(
  symbolMaster: Sketch.SymbolMaster,
  prefixPath: string[] = [],
): { layer: Sketch.SymbolInstance; layerPath: string[] }[] {
  return symbolMaster.layers
    .filter(Layers.isSymbolInstance)
    .flatMap((layer) => {
      const block = Blocks[layer.symbolID];
      const layerPath = [...prefixPath, layer.do_objectID];
      const self = { layer, layerPath };

      if (block.isPassthrough) {
        return flattenPassthroughLayers(block.symbol, layerPath);
      }

      if (block.isComposedBlock) {
        return [self, ...flattenPassthroughLayers(block.symbol, layerPath)];
      }

      return [self];
    });
}
