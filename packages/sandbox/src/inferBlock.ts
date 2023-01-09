import { DrawableLayerType } from 'noya-state';
import { buttonSymbol, avatarSymbol } from './symbols';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';

export const BLOCK_TYPE_HEURISTICS = {
  [buttonSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [avatarSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    if (
      rect.width > 30 &&
      rect.width < 50 &&
      rect.height > 30 &&
      rect.height < 50 &&
      rect.width / rect.height > 0.8 &&
      rect.width / rect.height < 1.2
    ) {
      return 1;
    } else {
      return 0;
    }
  },
};

export function inferBlockTypes(
  input: BlockHeuristicInput,
): InferredBlockTypeResult[] {
  let results: InferredBlockTypeResult[] = [];

  for (const [symbolId, heuristicFunction] of Object.entries(
    BLOCK_TYPE_HEURISTICS,
  )) {
    results.push({
      type: { symbolId },
      score: heuristicFunction(input) ?? 0,
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

export function inferBlockType(input: BlockHeuristicInput): DrawableLayerType {
  return inferBlockTypes(input)[0].type;
}
