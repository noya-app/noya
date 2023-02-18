import { DrawableLayerType, InferBlockProps, InferBlockType } from 'noya-state';
import { allInsertableBlocks } from './blocks/blocks';
import { InferredBlockTypeResult } from './types';

export function inferBlockTypes(
  input: InferBlockProps,
): InferredBlockTypeResult[] {
  let results: InferredBlockTypeResult[] = [];

  for (const block of allInsertableBlocks) {
    results.push({
      type: { symbolId: block.symbol.symbolID },
      score: block.infer(input),
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
