import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { Blocks } from './blocks';

export function flattenPassthroughLayers(
  symbolMaster: Sketch.SymbolMaster,
  prefixPath: string[] = [],
  indent = 0,
): { layer: Sketch.SymbolInstance; layerPath: string[]; indent: number }[] {
  return symbolMaster.layers
    .filter(Layers.isSymbolInstance)
    .flatMap((layer) => {
      const block = Blocks[layer.symbolID];
      const layerPath = [...prefixPath, layer.do_objectID];
      const self = { layer, layerPath, indent };

      if (block.isPassthrough) {
        return flattenPassthroughLayers(block.symbol, layerPath, indent);
      }

      if (block.isComposedBlock) {
        return [
          self,
          ...flattenPassthroughLayers(block.symbol, layerPath, indent + 1),
        ];
      }

      return [self];
    });
}
