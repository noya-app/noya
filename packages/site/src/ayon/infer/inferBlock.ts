import { DrawableLayerType, InferBlockProps, InferBlockType } from 'noya-state';
import { allInsertableSymbols } from '../blocks/blocks';
import { InferredBlockTypeResult } from '../types';

export function inferBlockTypes(
  input: InferBlockProps,
): InferredBlockTypeResult[] {
  let results: InferredBlockTypeResult[] = [];

  for (const symbol of allInsertableSymbols) {
    results.push({
      type: { symbolId: symbol.symbolID },
      score:
        symbol.blockDefinition?.infer?.({
          frame: input.frame,
        }) ?? 0,
    });
  }

  results.sort(
    (
      a: { type: DrawableLayerType; score: number },
      b: { type: DrawableLayerType; score: number },
    ) => b.score - a.score,
  );

  return results;
}

export const inferBlockType: InferBlockType = (input) => {
  return inferBlockTypes(input)[0].type;
};
