import { readFileSync } from 'fs';
import path from 'path';
import {
  getBlockClassName,
  resolveTailwindClass,
} from '../ayon/blocks/tailwind';

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

describe('resolves styles', () => {
  it('background', () => {
    expect(resolveTailwindClass('bg-red-500')).toEqual({
      backgroundColor: '#ef4444',
    });
  });

  it('backdrop-blur', () => {
    expect(resolveTailwindClass('backdrop-blur')).toEqual({
      backdropFilter: 'blur(8px)',
    });
    expect(resolveTailwindClass('backdrop-blur-sm')).toEqual({
      backdropFilter: 'blur(4px)',
    });
  });

  it('text color', () => {
    expect(resolveTailwindClass('text-red-500')).toEqual({
      color: '#ef4444',
    });
  });

  it('fill color', () => {
    expect(resolveTailwindClass('fill-red-500')).toEqual({
      fill: '#ef4444',
    });
  });

  it('justify', () => {
    expect(resolveTailwindClass('justify-start')).toEqual({
      justifyContent: 'start',
    });

    expect(resolveTailwindClass('justify-center')).toEqual({
      justifyContent: 'center',
    });
  });

  it('items', () => {
    expect(resolveTailwindClass('items-start')).toEqual({
      alignItems: 'start',
    });
  });

  it('gap', () => {
    expect(resolveTailwindClass('gap-4')).toEqual({
      gap: '1rem',
    });
  });

  it('padding', () => {
    expect(resolveTailwindClass('p-4')).toEqual({
      padding: '1rem',
    });

    expect(resolveTailwindClass('px-4')).toEqual({
      paddingLeft: '1rem',
      paddingRight: '1rem',
    });
  });
});
