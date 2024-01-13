import { matchBreakpoint } from '../breakpoints';
import { extractClassNames } from '../extract';

it('matches breakpoints', () => {
  expect(matchBreakpoint(0)).toEqual('base');
  expect(matchBreakpoint(100)).toEqual('base');
  expect(matchBreakpoint(640)).toEqual('sm');
  expect(matchBreakpoint(768)).toEqual('md');
  expect(matchBreakpoint(1024)).toEqual('lg');
  expect(matchBreakpoint(1280)).toEqual('xl');
  expect(matchBreakpoint(1536)).toEqual('2xl');
  expect(matchBreakpoint(9999)).toEqual('2xl');
});

it('extracts by breakpoint', () => {
  const classNames = ['base', 'sm:sm', 'md:md', 'lg:lg', 'xl:xl', '2xl:2xl'];

  expect(extractClassNames(classNames, { breakpoint: 'base' })).toEqual([
    'base',
  ]);

  expect(extractClassNames(classNames, { breakpoint: 'sm' })).toEqual([
    'base',
    'sm',
  ]);

  expect(extractClassNames(classNames, { breakpoint: 'md' })).toEqual([
    'base',
    'sm',
    'md',
  ]);

  expect(extractClassNames(classNames, { breakpoint: 'lg' })).toEqual([
    'base',
    'sm',
    'md',
    'lg',
  ]);

  expect(extractClassNames(classNames, { breakpoint: 'xl' })).toEqual([
    'base',
    'sm',
    'md',
    'lg',
    'xl',
  ]);

  expect(extractClassNames(classNames, { breakpoint: '2xl' })).toEqual([
    'base',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
  ]);
});

it('extracts by color scheme', () => {
  const classNames = ['base', 'light:light', 'dark:dark'];

  expect(extractClassNames(classNames, { colorScheme: 'light' })).toEqual([
    'base',
    'light',
  ]);

  expect(extractClassNames(classNames, { colorScheme: 'dark' })).toEqual([
    'base',
    'dark',
  ]);
});
