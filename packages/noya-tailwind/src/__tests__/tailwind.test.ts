import {
  getBlockClassName,
  getColor,
  parametersToTailwindStyle,
  resolveTailwindClass,
  simpleAlignmentResolver,
} from '../tailwind';

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

it('gets color', () => {
  expect(getColor('text-red-500')).toEqual('#ef4444');
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

  it('margin', () => {
    expect(resolveTailwindClass('m-4')).toEqual({
      margin: '1rem',
    });

    expect(resolveTailwindClass('mx-4')).toEqual({
      marginLeft: '1rem',
      marginRight: '1rem',
    });

    expect(resolveTailwindClass('mx-auto')).toEqual({
      marginLeft: 'auto',
      marginRight: 'auto',
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

  it('width', () => {
    expect(resolveTailwindClass('w-4')).toEqual({
      width: '1rem',
    });

    expect(resolveTailwindClass('w-full')).toEqual({
      width: '100%',
    });

    expect(resolveTailwindClass('w-1/2')).toEqual({
      width: '50%',
    });

    expect(resolveTailwindClass('w-screen')).toEqual({
      width: '100vw',
    });
  });

  it('height', () => {
    expect(resolveTailwindClass('h-4')).toEqual({
      height: '1rem',
    });

    expect(resolveTailwindClass('h-full')).toEqual({
      height: '100%',
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

  it('position', () => {
    expect(resolveTailwindClass('absolute')).toEqual({
      position: 'absolute',
    });
  });

  it('top', () => {
    expect(resolveTailwindClass('top-4')).toEqual({
      top: '1rem',
    });
  });

  it('minWidth', () => {
    expect(resolveTailwindClass('min-w-0')).toEqual({
      minWidth: '0px',
    });
  });

  it('maxWidth', () => {
    expect(resolveTailwindClass('max-w-full')).toEqual({
      maxWidth: '100%',
    });
  });

  it('minHeight', () => {
    expect(resolveTailwindClass('min-h-0')).toEqual({
      minHeight: '0px',
    });
  });

  it('maxHeight', () => {
    expect(resolveTailwindClass('max-h-full')).toEqual({
      maxHeight: '100%',
    });
  });

  it('lineHeight', () => {
    expect(resolveTailwindClass('leading-4')).toEqual({
      lineHeight: '1rem',
    });

    expect(resolveTailwindClass('leading-none')).toEqual({
      lineHeight: '1',
    });

    expect(resolveTailwindClass('leading-relaxed')).toEqual({
      lineHeight: '1.625',
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

  it('creates gradient', () => {
    expect(
      parametersToTailwindStyle([
        'bg-gradient-to-r',
        'from-red-500',
        'to-blue-500',
      ]),
    ).toEqual({
      backgroundImage: 'linear-gradient(to right, #ef4444, #3b82f6)',
    });
  });

  it('custom resolver', () => {
    expect(
      parametersToTailwindStyle({ center: true }, simpleAlignmentResolver),
    ).toEqual({
      textAlign: 'center',
    });
  });
});
