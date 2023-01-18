import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import { DrawableLayerType } from 'noya-state';
import {
  avatarSymbol,
  boxSymbol,
  buttonSymbol,
  checkboxSymbol,
  headerBarNavUserSymbol,
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  writeSymbol,
} from './symbols';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';

export const BLOCK_TYPE_HEURISTICS = {
  [buttonSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(
      scoreCommandMatch(buttonSymbol, text),
      isWithinRectRange(rect, 60, 30, 300, 80) ? 0.8 : 0,
    ),
  [avatarSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(
      scoreCommandMatch(avatarSymbol, text),
      isWithinRectRange(rect, 30, 30, 120, 120) &&
        isApproximatelySquare(rect, 0.2)
        ? 0.8
        : 0,
    ),
  [boxSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(boxSymbol, text), 0.1),
  [checkboxSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(
      scoreCommandMatch(checkboxSymbol, text),
      isWithinRectRange(rect, 10, 10, 20, 20) &&
        isApproximatelySquare(rect, 0.1)
        ? 0.8
        : 0,
    ),
  [iconButtonSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(iconButtonSymbol, text), 0.1),
  [inputSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(inputSymbol, text), 0.1),
  [switchSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(switchSymbol, text), 0.1),
  [textSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(
      scoreCommandMatch(textSymbol, text),
      text && text.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  [imageSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(imageSymbol, text), 0.1),
  [heading1Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading1Symbol, text), 0.1),
  [heading2Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading2Symbol, text), 0.1),
  [heading3Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading3Symbol, text), 0.1),
  [heading4Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading4Symbol, text), 0.1),
  [heading5Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading5Symbol, text), 0.1),
  [heading6Symbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(heading6Symbol, text), 0.1),
  [writeSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(scoreCommandMatch(writeSymbol, text), 0.1),
  [headerBarNavUserSymbol.symbolID]: ({ rect, text }: BlockHeuristicInput) =>
    Math.max(
      scoreCommandMatch(headerBarNavUserSymbol, text),
      isWithinRectRange(rect, 400, 30, 2000, 100) && rect.x < 30 && rect.y < 30
        ? 1
        : 0,
      0.1,
    ),
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

function commonPrefixLength(a?: string, b?: string) {
  if (!a || !b) {
    return 0;
  }
  if (a === b) {
    return a.length;
  }
  const firstDiffCharIndex = [...a].findIndex(
    (character, index) => character !== b[index],
  );
  return firstDiffCharIndex === -1 ? 0 : firstDiffCharIndex;
}

function scoreCommandMatch(symbolMaster: Sketch.SymbolMaster, text?: string) {
  const command = `/${symbolMaster.name.toLowerCase()}`;
  const words = text?.split(/\s/);
  const slashWords = words?.filter((word) => word[0] === '/' && word !== '/');

  return (slashWords ?? [])
    .map((word) => commonPrefixLength(command, word) - 1)
    .reduce((a, b) => Math.max(a, b), -1);
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
