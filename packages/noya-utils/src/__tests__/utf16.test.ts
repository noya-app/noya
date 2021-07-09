import { UTF16 } from '../index';
import util from 'util';

beforeAll(() => {
  window.TextEncoder = window.TextEncoder ?? util.TextEncoder;
});

test('converts UTF16 to UTF8', () => {
  expect([...UTF16.toUTF8('A')]).toEqual([65]);
  expect([...UTF16.toUTF8('ë')]).toEqual([195, 171]);
  expect([...UTF16.toUTF8('€')]).toEqual([226, 130, 172]);
  expect([...UTF16.toUTF8('👨‍👩‍👧‍👦')]).toEqual([
    240,
    159,
    145,
    168,
    226,
    128,
    141,
    240,
    159,
    145,
    169,
    226,
    128,
    141,
    240,
    159,
    145,
    167,
    226,
    128,
    141,
    240,
    159,
    145,
    166,
  ]);
});
