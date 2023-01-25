import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';

export function isWithinRectRange(
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

export function isApproximatelySquare(rect: Rect, tolerance: number) {
  return (
    Math.abs(rect.width - rect.height) <=
    tolerance * Math.min(rect.width, rect.height)
  );
}

export function commonPrefixLength(a?: string, b?: string) {
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

export function scoreCommandMatch(
  symbolMaster: Sketch.SymbolMaster,
  text?: string,
) {
  const command = `/${symbolMaster.name.toLowerCase()}`;
  const words = text?.split(/\s/);
  const slashWords = words?.filter((word) => word[0] === '/' && word !== '/');

  return (slashWords ?? [])
    .map((word) => commonPrefixLength(command, word) - 1)
    .reduce((a, b) => Math.max(a, b), -1);
}
