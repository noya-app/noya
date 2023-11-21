// MIT https://github.com/spatie/tailwind-safelist-generator/blob/81bbf9e11e28b2e25a74ecfb8e2a1ab5b09595ba/tests/generator.test.js

import { ThemeFunction, generateClasses } from '../safelist';

const theme: ThemeFunction = (key: string) =>
  ({
    spacing: { 0: '0', 1: '0.25rem' },
    colors: {
      white: 'white',
      black: 'black',
      red: { 100: '#fee2e2', 900: '#7f1d1d' },
    },
    borderWidth: { 0: '0', DEFAULT: '1px' },
    screens: { sm: '640px', lg: '1024px' },
    aspectRatios: { '21-9': [21, 9], '16-9': [16, 9] },
  }[key]);

it('generates a safelist without tokens', () =>
  expect(generateClasses(theme)(['m-0'])).toEqual(['m-0']));

it('generates a safelist with a token', () =>
  expect(generateClasses(theme)(['border-{colors}'])).toEqual([
    'border-white',
    'border-black',
    'border-red-100',
    'border-red-900',
  ]));

it('generates a safelist with multiple tokens', () =>
  expect(generateClasses(theme)(['{screens}:m-{spacing}'])).toEqual([
    'sm:m-0',
    'sm:m-1',
    'lg:m-0',
    'lg:m-1',
  ]));

it('generates a safelist with a token using array values', () =>
  expect(generateClasses(theme)(['embed-{aspectRatios}'])).toEqual([
    'embed-21-9',
    'embed-16-9',
  ]));

it('strips "DEFAULT" keys', () =>
  expect(generateClasses(theme)(['border-{borderWidth}'])).toEqual([
    'border-0',
    'border',
  ]));
