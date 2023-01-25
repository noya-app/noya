import { DrawableLayerType, InferBlockProps, InferBlockType } from 'noya-state';
import { AvatarBlock } from './blocks/AvatarBlock';
import { BoxBlock } from './blocks/BoxBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { CheckboxBlock } from './blocks/CheckboxBlock';
import { isWithinRectRange, scoreCommandMatch } from './blocks/score';
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
} from './blocks/symbols';
import { InferredBlockTypeResult } from './types';

export const BLOCK_TYPE_HEURISTICS: Record<
  string,
  (props: InferBlockProps) => number
> = {
  [buttonSymbol.symbolID]: ButtonBlock.infer,
  [avatarSymbol.symbolID]: AvatarBlock.infer,
  [boxSymbol.symbolID]: BoxBlock.infer,
  [checkboxSymbol.symbolID]: CheckboxBlock.infer,
  [iconButtonSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(iconButtonSymbol.name, blockText), 0.1),
  [inputSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(inputSymbol.name, blockText), 0.1),
  [switchSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(switchSymbol.name, blockText), 0.1),
  [textSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(
      scoreCommandMatch(textSymbol.name, blockText),
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  [imageSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(imageSymbol.name, blockText), 0.1),
  [heading1Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading1Symbol.name, blockText), 0.1),
  [heading2Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading2Symbol.name, blockText), 0.1),
  [heading3Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading3Symbol.name, blockText), 0.1),
  [heading4Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading4Symbol.name, blockText), 0.1),
  [heading5Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading5Symbol.name, blockText), 0.1),
  [heading6Symbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(heading6Symbol.name, blockText), 0.1),
  [writeSymbol.symbolID]: ({ frame, blockText }) =>
    Math.max(scoreCommandMatch(writeSymbol.name, blockText), 0.1),
  [headerBarNavUserSymbol.symbolID]: ({ frame, blockText, siblingBlocks }) => {
    if (
      siblingBlocks.find(
        (block) => block.symbolId === headerBarNavUserSymbol.symbolID,
      )
    ) {
      return 0;
    }

    return Math.max(
      scoreCommandMatch(headerBarNavUserSymbol.name, blockText),
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
      scoreCommandMatch(heroSymbol.name, blockText),
      isWithinRectRange(frame, 400, 200, 2000, 550) && frame.y < 180 ? 1 : 0,
      0.1,
    );
  },
};

export function inferBlockTypes(
  input: InferBlockProps,
): InferredBlockTypeResult[] {
  let results: InferredBlockTypeResult[] = [];

  for (const [symbolId, heuristicFunction] of Object.entries(
    BLOCK_TYPE_HEURISTICS,
  )) {
    results.push({
      type: { symbolId },
      score: heuristicFunction(input),
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
