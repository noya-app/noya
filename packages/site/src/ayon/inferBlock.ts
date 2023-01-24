import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import { DrawableLayerType, InferBlockProps, InferBlockType } from 'noya-state';
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
  heroSymbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  writeSymbol,
} from './symbols';
import { InferredBlockTypeResult } from './types';

export const BLOCK_TYPE_HEURISTICS: Record<
  string,
  (props: InferBlockProps) => number
> = {
  [buttonSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(buttonSymbol, blockText),
      isWithinRectRange(frame, 60, 30, 300, 80) ? 0.8 : 0,
    ),
  [avatarSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(avatarSymbol, blockText),
      isWithinRectRange(frame, 30, 30, 120, 120) &&
        isApproximatelySquare(frame, 0.2)
        ? 0.8
        : 0,
    ),
  [boxSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(boxSymbol, blockText), 0.1),
  [checkboxSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(checkboxSymbol, blockText),
      isWithinRectRange(frame, 10, 10, 20, 20) &&
        isApproximatelySquare(frame, 0.1)
        ? 0.8
        : 0,
    ),
  [iconButtonSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(iconButtonSymbol, blockText), 0.1),
  [inputSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(inputSymbol, blockText), 0.1),
  [switchSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(switchSymbol, blockText), 0.1),
  [textSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(textSymbol, blockText),
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  [imageSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(imageSymbol, blockText), 0.1),
  [heading1Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading1Symbol, blockText), 0.1),
  [heading2Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading2Symbol, blockText), 0.1),
  [heading3Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading3Symbol, blockText), 0.1),
  [heading4Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading4Symbol, blockText), 0.1),
  [heading5Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading5Symbol, blockText), 0.1),
  [heading6Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading6Symbol, blockText), 0.1),
  [writeSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(writeSymbol, blockText), 0.1),
  [headerBarNavUserSymbol.symbolID]: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find(
        (block) => block.symbolId === headerBarNavUserSymbol.symbolID,
      )
    ) {
      return 0;
    }

    return Math.max(
      scoreCommandMatch(headerBarNavUserSymbol, blockText),
      isWithinRectRange(frame, 400, 30, 2000, 100) &&
        frame.x < 30 &&
        frame.y < 30
        ? 1
        : 0,
      0.1,
    );
  },
  [heroSymbol.symbolID]: ({ frame, blockText, siblingBlocks }) => {
    if (siblingBlocks.find((block) => block.symbolId === heroSymbol.symbolID)) {
      return 0;
    }

    return Math.max(
      scoreCommandMatch(heroSymbol, blockText),
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
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
  input: InferBlockProps,
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

export const inferBlockType: InferBlockType = (input) => {
  return inferBlockTypes(input)[0].type;
};
