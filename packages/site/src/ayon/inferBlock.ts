import { Rect } from 'noya-geometry';
import { DrawableLayerType } from 'noya-state';
import {
  buttonSymbol,
  avatarSymbol,
  boxSymbol,
  checkboxSymbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  headingSymbol,
} from './symbols';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';

export const BLOCK_TYPE_HEURISTICS = {
  [buttonSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    if (isWithinRectRange(rect, 60, 30, 300, 80)) {
      return 1;
    }
    return 0;
  },
  [avatarSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    if (
      isWithinRectRange(rect, 30, 30, 120, 120) &&
      isApproximatelySquare(rect, 0.2)
    ) {
      return 1;
    }
    return 0;
  },
  [boxSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [checkboxSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    if (
      isWithinRectRange(rect, 10, 10, 20, 20) &&
      isApproximatelySquare(rect, 0.1)
    ) {
      return 1;
    }
    return 0;
  },
  [iconButtonSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [inputSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [switchSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [textSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [imageSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
  [headingSymbol.symbolID]: ({ rect }: BlockHeuristicInput) => {
    return 0.1;
  },
};

function isWithinRectRange(
  rect: Rect,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
) {
  return (
    (!minWidth || rect.width >= minWidth) &&
    (!maxWidth || rect.width <= maxWidth) &&
    (!minHeight || rect.height >= minHeight) &&
    (!maxHeight || rect.height <= maxHeight)
  );
}

function isApproximatelySquare(rect: Rect, tolerance: number) {
  return (
    Math.abs(rect.width - rect.height) <=
    tolerance * Math.min(rect.width, rect.height)
  );
}

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
