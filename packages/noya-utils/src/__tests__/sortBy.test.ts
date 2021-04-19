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
        { name: 'Emma', last: 'Jones' },
        { name: 'Ava', last: 'Davis' },
      ],
      'name',
    ),
  ).toEqual([
    { name: 'Ava', last: 'Davis' },
    { name: 'Emma', last: 'Jones' },
    { name: 'Liam', last: 'Smith' },
    { name: 'Noah', last: 'Benjamin' },
    { name: 'Sophia', last: 'Brown' },
  ]);
});

test('second key', () => {
  expect(
    sortBy(
      [
        { name: 'Liam', last: 'Smith' },
        { name: 'Noah', last: 'Benjamin' },
        { name: 'Sophia', last: 'Brown' },
        { name: 'Emma', last: 'Jones' },
        { name: 'Ava', last: 'Davis' },
      ],
      'last',
    ),
  ).toEqual([
    { name: 'Noah', last: 'Benjamin' },
    { name: 'Sophia', last: 'Brown' },
    { name: 'Ava', last: 'Davis' },
    { name: 'Emma', last: 'Jones' },
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

test('empty spaces', () => {
  expect(
    sortBy(
      [
        { group: 'cloud', ammount: 9 },
        { group: 'dogs', ammount: 5 },
        { group: 'computer', ammount: 4 },
        { group: '', ammount: 8 },
        { group: 'square', ammount: 2 },
      ],
      'group',
    ),
  ).toEqual([
    { group: '', ammount: 8 },
    { group: 'cloud', ammount: 9 },
    { group: 'computer', ammount: 4 },
    { group: 'dogs', ammount: 5 },
    { group: 'square', ammount: 2 },
  ]);
});
