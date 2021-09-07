import { CSSObject } from 'styled-components';

export const size = {
  medium: '784px',
  large: '960px',
  xlarge: '1280px',
};

export const mediaQuery = {
  medium: `@media (min-width: ${size.medium})`,
  large: `@media (min-width: ${size.large})`,
  xlarge: `@media (min-width: ${size.xlarge})`,
};

export const cssVariables = {
  // '--heading1': '2.5rem',
  // '--heading2': '2rem',
  // '--heading3': '1.5rem',
  // '--body1': '1rem',
  // '--body2': '0.85rem',

  '--space-xxsmall': '0.125rem',
  '--space-xsmall': '0.25rem',
  '--space-small': '0.5rem',
  '--space-medium': '1rem',
  '--space-large': '2rem',
  '--space-xlarge': '3rem',
  '--space-xxlarge': '4rem',
  '--space-xxxlarge': '6rem',

  '--size-xxsmall': '0.125rem',
  '--size-xsmall': '0.25rem',
  '--size-small': '0.5rem',
  '--size-medium': '1rem',
  '--size-large': '2rem',
  '--size-xlarge': '3rem',
  '--size-xxlarge': '4rem',
  '--size-xxxlarge': '6rem',

  '--line-length-heading': '12ch',
  '--line-length-narrow': '24ch',
  '--line-length-wide': '60ch',

  // [mediaQuery.large]: {
  //   '--heading1': '3.5rem',
  //   '--heading2': '3rem',
  //   '--heading3': '2.5rem',
  //   '--body1': '1rem',
  //   '--body2': '0.85rem',
  // },

  // [mediaQuery.xlarge]: {
  '--heading1': '5rem',
  '--heading2': '4rem',
  '--heading3': '3rem',
  '--body1': '2rem',
  '--body2': '1rem',
  // },
};

export const colors = {};

export const textStyles: {
  [key: string]: CSSObject;
} = {
  heading1: {
    fontSize: `var(--heading1)`,
    fontWeight: 700,
    lineHeight: '1',
  },
  heading2: {
    fontSize: `var(--heading2)`,
    fontWeight: 500,
    lineHeight: '1.25',
  },
  heading3: {
    fontSize: `var(--heading3)`,
    fontWeight: 500,
    lineHeight: '1.25',
  },
  body1: {
    fontSize: `var(--body1)`,
    fontWeight: 400,
    lineHeight: '1.5',
  },
  body2: {
    fontSize: `var(--body2)`,
    fontWeight: 400,
    lineHeight: '1.25',
  },
  mark: {
    background: 'linear-gradient(180deg, #E3BEFF, #A734FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
};
