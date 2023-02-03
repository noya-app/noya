import { IItemScore, scoreFilePathFuzzy } from 'vscode-fuzzy-scorer';

export function fuzzyScore({ item, query }: { item: string; query: string }) {
  return scoreFilePathFuzzy({ path: item, query });
}

type IScoredItem = IItemScore & {
  index: number;
};

export function fuzzyFilter({
  items,
  query,
}: {
  items: string[];
  query: string;
}) {
  const scoredItems = items.map(
    (text, index): IScoredItem => ({
      index,
      ...fuzzyScore({ item: text, query }),
    }),
  );

  if (!query) return scoredItems;

  return scoredItems
    .filter(({ score }) => score > 0)
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

  for (const match of itemScore.labelMatch ?? []) {
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
