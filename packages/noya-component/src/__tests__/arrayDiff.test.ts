import {
  added,
  applyArrayDiff,
  computeArrayDiff,
  moved,
  removed,
} from '../arrayDiff';

test('append item', () => {
  const a = ['a'];
  const b = ['a', 'b'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([added('b', 1)]);
});

test('prepend item', () => {
  const a = ['b'];
  const b = ['a', 'b'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([added('a', 0)]);
});

test('inserts item', () => {
  const a = ['b'];
  const b = ['a', 'b', 'c'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([added('a', 0), added('c', 2)]);
});

test('removes item', () => {
  const a = ['a', 'b'];
  const b = ['a'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed(1)]);
});

test('removes item using key', () => {
  const a = ['a', 'b'];
  const b = ['a'];

  const diff = computeArrayDiff(a, b, (item) => item, { removalMode: 'key' });
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed('b')]);
});

test('replaces item', () => {
  const a = ['a', 'b', 'd'];
  const b = ['a', 'c', 'd'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed(1), added('c', 1)]);
});

test('replaces item with multiple changes', () => {
  const a = ['a', 'b', 'd'];
  const b = ['a', 'c', 'e'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed(1), removed(1), added('c', 1), added('e', 2)]);
});

test('swaps adjacent items', () => {
  const a = ['a', 'b'];
  const b = ['b', 'a'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([moved(0, 1)]);
});

test('swaps items', () => {
  const a = ['a', 'x', 'b'];
  const b = ['b', 'x', 'a'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([moved(0, 2), moved(0, 1)]);
});

test('moves item', () => {
  const a = ['a', 'b', 'c'];
  const b = ['b', 'c', 'a'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([moved(0, 2)]);
});

test('removes and moves item', () => {
  const a = ['a', 'b', 'c'];
  const b = ['c', 'a'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed(1), moved(0, 1)]);
});

test('moves and adds item', () => {
  const a = ['a', 'b', 'c'];
  const b = ['c', 'a', 'd'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([removed(1), added('d', 2), moved(0, 1)]);
});

test('swaps multiple pairs', () => {
  const a = ['a', 'b', 'x', 'y', 'c', 'd'];
  const b = ['b', 'a', 'x', 'y', 'd', 'c'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(b);
  expect(diff).toEqual([moved(0, 1), moved(4, 5)]);
});

test('filter duplicates', () => {
  let a = ['a'];
  let b = ['a', 'a', 'b'];

  const diff = computeArrayDiff(a, b);
  const applied = applyArrayDiff(a, diff);

  expect(applied).toEqual(['a', 'b']);
});

test('custom identity', () => {
  let a = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  let b = [{ id: 'b' }, { id: 'a' }];

  const diff = computeArrayDiff(a, b, (item) => item.id, {
    removalMode: 'key',
  });

  expect(diff).toEqual([removed('c'), moved(0, 1)]);
});
