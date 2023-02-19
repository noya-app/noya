import { readFileSync } from 'fs';
import path from 'path';
import { getBlockClassName } from '../ayon/blocks/tailwind';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

it('only applies last class within a group', () => {
  expect(getBlockClassName(['bg-red-500', 'bg-blue-500'])).toEqual(
    'bg-blue-500',
  );
});

it('applies one class within every group', () => {
  expect(getBlockClassName(['text-red-500', 'bg-blue-500'])).toEqual(
    'text-red-500 bg-blue-500',
  );
});
