import { fuzzyFilter, fuzzyScore, fuzzyTokenize } from '../utils/fuzzyScorer';

test('prefix match', () => {
  const result = fuzzyScore({ item: 'font-bold', query: 'font' });

  expect(result.labelMatch).toEqual([{ start: 0, end: 4 }]);
});

test('suffix match', () => {
  const result = fuzzyScore({ item: 'font-bold', query: 'bold' });

  expect(result.labelMatch).toEqual([{ start: 5, end: 9 }]);
});

test('non-contiguous match', () => {
  const result = fuzzyScore({ item: 'font-bold', query: 'fb' });

  expect(result.labelMatch).toEqual([
    { start: 0, end: 1 },
    { start: 5, end: 6 },
  ]);
});

test('filter single match', () => {
  const result = fuzzyFilter({
    items: ['font-bold', 'font-italic', 'font-regular'],
    query: 'bold',
  });

  expect(result).toMatchSnapshot();
});

test('filter multiple matches', () => {
  const result = fuzzyFilter({
    items: ['font-bold', 'border'],
    query: 'b',
  });

  expect(result).toMatchSnapshot();
});

test('tokenizes prefix match', () => {
  const item = 'font-bold';
  const query = 'font';
  const result = fuzzyTokenize({
    item,
    itemScore: fuzzyScore({ item, query }),
  });

  expect(result).toEqual([
    { type: 'match', text: 'font' },
    { type: 'text', text: '-bold' },
  ]);
});

test('tokenizes suffix match', () => {
  const item = 'font-bold';
  const query = 'bold';
  const result = fuzzyTokenize({
    item,
    itemScore: fuzzyScore({ item, query }),
  });

  expect(result).toEqual([
    { type: 'text', text: 'font-' },
    { type: 'match', text: 'bold' },
  ]);
});

test('tokenizes non-contiguous match', () => {
  const item = 'font-bold';
  const query = 'fb';
  const result = fuzzyTokenize({
    item,
    itemScore: fuzzyScore({ item, query }),
  });

  expect(result).toEqual([
    { type: 'match', text: 'f' },
    { type: 'text', text: 'ont-' },
    { type: 'match', text: 'b' },
    { type: 'text', text: 'old' },
  ]);
});
