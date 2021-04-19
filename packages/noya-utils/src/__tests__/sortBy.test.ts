import { sortBy } from '../index';

test('empty array', () => {
  expect(sortBy([], '')).toEqual([]);
});

test('first key', () => {
  expect(
    sortBy(
      [
        { name: 'Liam', last: 'Smith' },
        { name: 'Noah', last: 'Benjamin' },
        { name: 'Sophia', last: 'Brown' },
      ],
      'name',
    ),
  ).toEqual([
    { name: 'Liam', last: 'Smith' },
    { name: 'Noah', last: 'Benjamin' },
    { name: 'Sophia', last: 'Brown' },
  ]);
});

test('second key', () => {
  expect(
    sortBy(
      [
        { name: 'Noah', last: 'Benjamin' },
        { name: 'Sophia', last: 'Brown' },
        { name: 'Ava', last: 'Davis' },
      ],
      'last',
    ),
  ).toEqual([
    { name: 'Noah', last: 'Benjamin' },
    { name: 'Sophia', last: 'Brown' },
    { name: 'Ava', last: 'Davis' },
  ]);
});

test('same value', () => {
  expect(
    sortBy(
      [
        { name: 'Liam', last: 'Smith' },
        { name: 'Liam', last: 'Brown' },
        { name: 'Ava', last: 'Davis' },
      ],
      'name',
    ),
  ).toEqual([
    { name: 'Ava', last: 'Davis' },
    { name: 'Liam', last: 'Smith' },
    { name: 'Liam', last: 'Brown' },
  ]);
});

test('empty space', () => {
  expect(sortBy([{ group: 'dogs' }, { group: '' }], 'group')).toEqual([
    { group: '' },
    { group: 'dogs' },
  ]);
});

test('upper and lower case', () => {
  expect(
    sortBy(
      [{ letter: 'B' }, { letter: 'a' }, { letter: 'A' }, { letter: 'b' }],
      'letter',
    ),
  ).toEqual([
    { letter: 'a' },
    { letter: 'A' },
    { letter: 'B' },
    { letter: 'b' },
  ]);
});

test('"/" usage', () => {
  expect(
    sortBy(
      [{ group: 'B/a' }, { group: 'A/d' }, { group: 'B/c' }, { group: 'A/n' }],
      'group',
    ),
  ).toEqual([
    { group: 'A/d' },
    { group: 'A/n' },
    { group: 'B/a' },
    { group: 'B/c' },
  ]);
});
