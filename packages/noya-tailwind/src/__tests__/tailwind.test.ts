import { parseTailwindClass, stringifyTailwindClass } from '../parse';
import {
  classNameToStyle,
  classNamesToStyle,
  filterTailwindClassesByLastInGroup,
} from '../tailwind';

describe('parse class name', () => {
  it('basic', () => {
    expect(parseTailwindClass('bg-red-500')).toEqual({
      className: 'bg-red-500',
    });

    expect(stringifyTailwindClass({ className: 'bg-red-500' })).toEqual(
      'bg-red-500',
    );
  });

  it('opacity', () => {
    expect(parseTailwindClass('bg-red-500/10')).toEqual({
      className: 'bg-red-500',
      opacity: '10',
    });

    expect(
      stringifyTailwindClass({ className: 'bg-red-500', opacity: '10' }),
    ).toEqual('bg-red-500/10');
  });

  it('empty opacity', () => {
    expect(parseTailwindClass('bg-red-500/')).toEqual({
      className: 'bg-red-500',
      opacity: '',
    });

    expect(
      stringifyTailwindClass({ className: 'bg-red-500', opacity: '' }),
    ).toEqual('bg-red-500');
  });

  it('prefix', () => {
    expect(parseTailwindClass('lg:bg-red-500')).toEqual({
      className: 'bg-red-500',
      prefix: 'lg',
    });

    expect(
      stringifyTailwindClass({ className: 'bg-red-500', prefix: 'lg' }),
    ).toEqual('lg:bg-red-500');
  });

  it('opacity with prefix', () => {
    expect(parseTailwindClass('lg:bg-red-500/10')).toEqual({
      className: 'bg-red-500',
      opacity: '10',
      prefix: 'lg',
    });

    expect(
      stringifyTailwindClass({
        className: 'bg-red-500',
        opacity: '10',
        prefix: 'lg',
      }),
    ).toEqual('lg:bg-red-500/10');
  });
});

describe('resolves styles', () => {
  it('background', () => {
    expect(classNameToStyle('bg-red-500')).toEqual({
      backgroundColor: '#ef4444',
    });
    expect(classNameToStyle('bg-[#000000e5]')).toEqual({
      backgroundColor: '#000000e5',
    });
    expect(classNameToStyle('bg-red-500/50')).toEqual({
      backgroundColor: '#ef44447f',
    });
    expect(classNameToStyle('bg-white/50')).toEqual({
      backgroundColor: '#ffffff7f',
    });
  });

  it('blur', () => {
    expect(classNameToStyle('blur')).toEqual({
      filter: 'blur(8px)',
    });
    expect(classNameToStyle('blur-sm')).toEqual({
      filter: 'blur(4px)',
    });
  });

  it('backdrop-blur', () => {
    expect(classNameToStyle('backdrop-blur')).toEqual({
      backdropFilter: 'blur(8px)',
    });
    expect(classNameToStyle('backdrop-blur-sm')).toEqual({
      backdropFilter: 'blur(4px)',
    });
  });

  it('text color', () => {
    expect(classNameToStyle('text-red-500')).toEqual({
      color: '#ef4444',
    });
  });

  it('font size', () => {
    expect(classNameToStyle('text-xl')).toEqual({
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
    });

    expect(classNameToStyle('text-xs')).toEqual({
      fontSize: '0.75rem',
      lineHeight: '1rem',
    });
  });

  it('fill color', () => {
    expect(classNameToStyle('fill-red-500')).toEqual({
      fill: '#ef4444',
    });
  });

  it('justify', () => {
    expect(classNameToStyle('justify-start')).toEqual({
      justifyContent: 'start',
    });

    expect(classNameToStyle('justify-center')).toEqual({
      justifyContent: 'center',
    });
  });

  it('items', () => {
    expect(classNameToStyle('items-start')).toEqual({
      alignItems: 'start',
    });
    expect(classNameToStyle('items-baseline')).toEqual({
      alignItems: 'baseline',
    });
  });

  it('gap', () => {
    expect(classNameToStyle('gap-4')).toEqual({
      gap: '1rem',
    });
  });

  it('flex', () => {
    expect(classNameToStyle('flex-1')).toEqual({
      flex: '1',
    });
  });

  it('flexBasis', () => {
    expect(classNameToStyle('basis-20')).toEqual({
      flexBasis: '5rem',
    });
  });

  it('padding', () => {
    expect(classNameToStyle('p-4')).toEqual({
      padding: '1rem',
    });

    expect(classNameToStyle('px-4')).toEqual({
      paddingLeft: '1rem',
      paddingRight: '1rem',
    });
  });

  it('margin', () => {
    expect(classNameToStyle('m-4')).toEqual({
      margin: '1rem',
    });

    expect(classNameToStyle('mx-4')).toEqual({
      marginLeft: '1rem',
      marginRight: '1rem',
    });

    expect(classNameToStyle('mx-auto')).toEqual({
      marginLeft: 'auto',
      marginRight: 'auto',
    });
  });

  it('shadow', () => {
    expect(classNameToStyle('shadow')).toEqual({
      boxShadow:
        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });

    expect(classNameToStyle('shadow-none')).toEqual({
      boxShadow: 'none',
    });

    expect(classNamesToStyle(['shadow', 'shadow-red-500'])).toEqual({
      boxShadow: '0 1px 3px 0 #ef4444, 0 1px 2px -1px #ef4444',
    });
  });

  it('borderRadius', () => {
    expect(classNameToStyle('rounded')).toEqual({
      borderRadius: '0.25rem',
    });

    expect(classNameToStyle('rounded-2xl')).toEqual({
      borderRadius: '1rem',
    });
  });

  it('borderColor', () => {
    expect(classNameToStyle('border-black')).toEqual({
      borderColor: '#000',
    });
  });

  it('width', () => {
    expect(classNameToStyle('w-4')).toEqual({
      width: '1rem',
    });

    expect(classNameToStyle('w-full')).toEqual({
      width: '100%',
    });

    expect(classNameToStyle('w-1/2')).toEqual({
      width: '50%',
    });

    expect(classNameToStyle('w-screen')).toEqual({
      width: '100vw',
    });
  });

  it('height', () => {
    expect(classNameToStyle('h-4')).toEqual({
      height: '1rem',
    });

    expect(classNameToStyle('h-full')).toEqual({
      height: '100%',
    });

    expect(classNameToStyle('h-1/2')).toEqual({
      height: '50%',
    });

    expect(classNameToStyle('h-0.5')).toEqual({
      height: '0.125rem',
    });

    expect(classNameToStyle('h-px')).toEqual({
      height: '1px',
    });
  });

  it('borderWidth', () => {
    expect(classNameToStyle('border')).toEqual({
      borderWidth: '1px',
    });

    expect(classNameToStyle('border-2')).toEqual({
      borderWidth: '2px',
    });

    expect(classNameToStyle('border-x')).toEqual({
      borderLeftWidth: '1px',
      borderRightWidth: '1px',
    });

    expect(classNameToStyle('border-x-2')).toEqual({
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
    });
  });

  it('grid', () => {
    expect(classNameToStyle('grid')).toEqual({
      display: 'grid',
    });

    expect(classNameToStyle('grid-flow-col')).toEqual({
      gridAutoFlow: 'column',
    });

    expect(classNameToStyle('auto-cols-max')).toEqual({
      gridAutoColumns: 'max-content',
    });

    expect(classNameToStyle('col-span-2')).toEqual({
      gridColumn: 'span 2 / span 2',
    });
  });

  it('position', () => {
    expect(classNameToStyle('absolute')).toEqual({
      position: 'absolute',
    });
  });

  it('top', () => {
    expect(classNameToStyle('top-4')).toEqual({
      top: '1rem',
    });
  });

  it('minWidth', () => {
    expect(classNameToStyle('min-w-0')).toEqual({
      minWidth: '0px',
    });
  });

  it('maxWidth', () => {
    expect(classNameToStyle('max-w-full')).toEqual({
      maxWidth: '100%',
    });
  });

  it('minHeight', () => {
    expect(classNameToStyle('min-h-0')).toEqual({
      minHeight: '0px',
    });
  });

  it('maxHeight', () => {
    expect(classNameToStyle('max-h-full')).toEqual({
      maxHeight: '100%',
    });
  });

  it('lineHeight', () => {
    expect(classNameToStyle('leading-4')).toEqual({
      lineHeight: '1rem',
    });

    expect(classNameToStyle('leading-none')).toEqual({
      lineHeight: '1',
    });

    expect(classNameToStyle('leading-relaxed')).toEqual({
      lineHeight: '1.625',
    });
  });

  it('isolates', () => {
    expect(classNameToStyle('isolate')).toEqual({
      isolation: 'isolate',
    });
  });

  it('zIndex', () => {
    expect(classNameToStyle('z-10')).toEqual({
      zIndex: '10',
    });

    // negative
    expect(classNameToStyle('-z-10')).toEqual({
      zIndex: '-10',
    });
  });
});

describe('last class in group', () => {
  it('basic', () => {
    const result = filterTailwindClassesByLastInGroup([
      'bg-red-500',
      'bg-blue-500',
    ]);

    expect(result).toEqual(['bg-blue-500']);
  });

  it('with prefix', () => {
    const result = filterTailwindClassesByLastInGroup([
      'dark:bg-red-500',
      'dark:bg-blue-500',
    ]);

    expect(result).toEqual(['dark:bg-blue-500']);
  });

  it('prefix after base is kept', () => {
    const result = filterTailwindClassesByLastInGroup([
      'bg-red-500',
      'dark:bg-blue-500',
    ]);

    expect(result).toEqual(['bg-red-500', 'dark:bg-blue-500']);
  });

  it('prefix before base is removed', () => {
    const result = filterTailwindClassesByLastInGroup([
      'dark:bg-red-500',
      'bg-blue-500',
    ]);

    expect(result).toEqual(['bg-blue-500']);
  });

  it('keeps different prefixes', () => {
    const result = filterTailwindClassesByLastInGroup([
      'dark:bg-red-500',
      'lg:bg-blue-500',
    ]);

    expect(result).toEqual(['dark:bg-red-500', 'lg:bg-blue-500']);
  });
});

describe('parameters', () => {
  it('basic', () => {
    expect(classNamesToStyle(['text-red-500'])).toEqual({
      color: '#ef4444',
    });
  });

  it('last in group wins', () => {
    expect(classNamesToStyle(['text-red-500', 'text-blue-500'])).toEqual({
      color: '#3b82f6',
    });
  });

  it('merge', () => {
    expect(classNamesToStyle(['items-center', 'justify-center'])).toEqual({
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('creates gradient', () => {
    expect(
      classNamesToStyle(['bg-gradient-to-r', 'from-red-500', 'to-blue-500']),
    ).toEqual({
      backgroundImage: 'linear-gradient(to right, #ef4444, #3b82f6)',
    });
  });

  it('custom resolver', () => {
    expect(
      classNamesToStyle(['foo'], {
        resolve: (c) => (c === 'foo' ? { textAlign: 'center' } : null),
      }),
    ).toEqual({
      textAlign: 'center',
    });
  });

  describe('ring', () => {
    it('default', () => {
      expect(classNamesToStyle(['ring'])).toEqual({
        boxShadow: '0 0 0 3px #3b82f680',
      });
    });

    it('width', () => {
      expect(classNamesToStyle(['ring-2'])).toEqual({
        boxShadow: '0 0 0 2px #3b82f680',
      });
    });

    it('color', () => {
      expect(classNamesToStyle(['ring', 'ring-blue-500'])).toEqual({
        boxShadow: '0 0 0 3px #3b82f6',
      });
    });

    it('inset', () => {
      expect(classNamesToStyle(['ring', 'ring-inset'])).toEqual({
        boxShadow: 'inset 0 0 0 3px #3b82f680',
      });
    });
  });
});
