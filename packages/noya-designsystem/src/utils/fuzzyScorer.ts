import { IItemScore, scoreFilePathFuzzy } from 'vscode-fuzzy-scorer';

export function fuzzyScore({ item, query }: { item: string; query: string }) {
  return scoreFilePathFuzzy({ path: item, query });
}

export type IScoredItem = IItemScore & {
  index: number;
};

export function fuzzyFilter({
  items,
  query,
  scoreThreshold = 0,
}: {
  items: string[];
  query: string;
  scoreThreshold?: number;
}) {
  const scoredItems = items.map(
    (text, index): IScoredItem => ({
      index,
      ...fuzzyScore({ item: text, query }),
    }),
  );

  if (!query) return scoredItems;

  return scoredItems
    .filter(({ score }) => score > scoreThreshold)
    .sort((a, b) => b.score - a.score);
}

export type IToken =
  | { type: 'text'; text: string }
  | { type: 'match'; text: string };

export function fuzzyTokenize({
  item,
  itemScore,
}: {
  item: string;
  itemScore: IItemScore;
}) {
  const tokens: IToken[] = [];

  let lastMatchIndex = 0;

  const matches = mergeRanges(itemScore.labelMatch, itemScore.descriptionMatch);

  for (const match of matches ?? []) {
    if (match.start > lastMatchIndex) {
      tokens.push({
        type: 'text',
        text: item.slice(lastMatchIndex, match.start),
      });
    }

    tokens.push({
      type: 'match',
      text: item.slice(match.start, match.end),
    });

    lastMatchIndex = match.end;
  }

  if (lastMatchIndex < item.length) {
    tokens.push({
      type: 'text',
      text: item.slice(lastMatchIndex),
    });
  }

  return tokens;
}

type MatchRange = { start: number; end: number };

function mergeRanges(a?: MatchRange[], b?: MatchRange[]): MatchRange[] {
  if (!a) return b ?? [];
  if (!b) return a;

  if (a.length === 0) return b;
  if (b.length === 0) return a;

  const merged: MatchRange[] = [];

  const all = [...a, ...b].sort((a, b) => a.start - b.start);

  let current: MatchRange | undefined;

  for (const range of all) {
    if (!current) {
      current = range;
    } else if (range.start <= current.end) {
      current.end = Math.max(current.end, range.end);
    } else {
      merged.push(current);
      current = range;
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}
