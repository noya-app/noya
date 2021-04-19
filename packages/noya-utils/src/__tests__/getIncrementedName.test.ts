import { getIncrementedName } from '../index';

test('empty Space', () => {
  expect(getIncrementedName('')).toEqual(' 2');
});

test('one word', () => {
  expect(getIncrementedName('A')).toEqual('A 2');
});

test('one digit number', () => {
  expect(getIncrementedName('A 5')).toEqual('A 6');
});

test('two digit number', () => {
  expect(getIncrementedName('A 13')).toEqual('A 14');
});

test('invalid number at the end', () => {
  expect(getIncrementedName('A2')).toEqual('A2 2');
});
