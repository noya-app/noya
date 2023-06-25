import { readFileSync } from 'fs';
import path from 'path';
import {
  getBlockClassName,
  parametersToTailwindStyle,
  resolveTailwindClass,
  simpleAlignmentResolver,
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
    expect(resolveTailwindClass('bg-[#000000e5]')).toEqual({
      backgroundColor: '#000000e5',
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

  it('flex', () => {
    expect(resolveTailwindClass('flex-1')).toEqual({
      flex: '1',
    });
  });

  it('flexBasis', () => {
    expect(resolveTailwindClass('basis-20')).toEqual({
      flexBasis: '5rem',
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

  it('shadow', () => {
    expect(resolveTailwindClass('shadow')).toEqual({
      boxShadow:
        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });

    expect(resolveTailwindClass('shadow-none')).toEqual({
      boxShadow: 'none',
    });
  });

  it('borderRadius', () => {
    expect(resolveTailwindClass('rounded')).toEqual({
      borderRadius: '0.25rem',
    });

    expect(resolveTailwindClass('rounded-2xl')).toEqual({
      borderRadius: '1rem',
    });
  });

  it('borderColor', () => {
    expect(resolveTailwindClass('border-black')).toEqual({
      borderColor: '#000',
    });
  });

  it('borderWidth', () => {
    expect(resolveTailwindClass('border')).toEqual({
      borderWidth: '1px',
    });

    expect(resolveTailwindClass('border-2')).toEqual({
      borderWidth: '2px',
    });

    expect(resolveTailwindClass('border-x')).toEqual({
      borderLeftWidth: '1px',
      borderRightWidth: '1px',
    });

    expect(resolveTailwindClass('border-x-2')).toEqual({
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
    });
  });

  it('grid', () => {
    expect(resolveTailwindClass('grid')).toEqual({
      display: 'grid',
    });

    expect(resolveTailwindClass('grid-flow-col')).toEqual({
      gridAutoFlow: 'column',
    });

    expect(resolveTailwindClass('auto-cols-max')).toEqual({
      gridAutoColumns: 'max-content',
    });
  });
});

describe('parameters', () => {
  it('basic', () => {
    expect(
      parametersToTailwindStyle({
        'text-red-500': true,
      }),
    ).toEqual({
      color: '#ef4444',
    });
  });

  it('last in group wins', () => {
    expect(
      parametersToTailwindStyle({
        'text-red-500': true,
        'text-blue-500': true,
      }),
    ).toEqual({
      color: '#3b82f6',
    });
  });

  it('merge', () => {
    expect(
      parametersToTailwindStyle({
        'items-center': true,
        'justify-center': true,
      }),
    ).toEqual({
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('customer resolver', () => {
    expect(
      parametersToTailwindStyle({ center: true }, simpleAlignmentResolver),
    ).toEqual({
      textAlign: 'center',
    });
  });
});
