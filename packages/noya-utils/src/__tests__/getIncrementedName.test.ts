import { getIncrementedName } from '../index';

test('empty Space', () => {
  expect(getIncrementedName('', [''])).toEqual(' 2');
});

test('one word', () => {
  expect(getIncrementedName('A', ['A'])).toEqual('A 2');
});

test('one digit number', () => {
  expect(getIncrementedName('A 5', ['A 5'])).toEqual('A 6');
});

test('two digit number', () => {
  expect(getIncrementedName('A 15', ['A 15'])).toEqual('A 16');
});

test('invalid number at the end', () => {
  expect(getIncrementedName('A2', ['A2'])).toEqual('A2 2');
});

test('bigger number in array', () => {
  expect(getIncrementedName('A', ['A', 'A 3'])).toEqual('A 4');
});
