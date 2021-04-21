import { sortBy } from '../index';

const names = [
  { name: 'Liam', last: 'Smith' },
  { name: 'Ava', last: 'Davis' },
  { name: 'Sophia', last: 'Brown' },
];

test('empty array', () => {
  expect(sortBy([], '')).toEqual([]);
});

test('first key', () => {
  expect(sortBy(names, 'name')).toEqual([
    { name: 'Ava', last: 'Davis' },
    { name: 'Liam', last: 'Smith' },
    { name: 'Sophia', last: 'Brown' },
  ]);
});

test('second key', () => {
  expect(sortBy(names, 'last')).toEqual([
    { name: 'Sophia', last: 'Brown' },
    { name: 'Ava', last: 'Davis' },
    { name: 'Liam', last: 'Smith' },
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
      [
        { group: 'B/a' },
        { group: 'A/d' },
        { group: 'A/n' },
        { group: 'BB/a' },
        { group: 'AA/b' },
      ],
      'group',
    ),
  ).toEqual([
    { group: 'A/d' },
    { group: 'A/n' },
    { group: 'AA/b' },
    { group: 'B/a' },
    { group: 'BB/a' },
  ]);
});
