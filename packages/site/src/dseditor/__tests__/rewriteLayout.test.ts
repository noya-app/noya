import {
  rewriteImagesWithChildren,
  rewriteInferFlex,
  rewritePositionedParent,
  rewriteRootClasses,
  rewriteTailwindClasses,
} from '../rewriteLayout';

it('replaces grow with flex-1', () => {
  expect(
    rewriteTailwindClasses({
      tag: 'Box',
      attributes: {
        class: 'grow',
      },
      children: [],
    }),
  ).toEqual({
    tag: 'Box',
    attributes: {
      class: 'flex-1',
    },
    children: [],
  });
});

it('adds flex-1 to root', () => {
  expect(
    rewriteRootClasses({
      tag: 'Box',
      attributes: {},
      children: [],
    }),
  ).toEqual({
    tag: 'Box',
    attributes: {
      class: 'flex-1',
    },
    children: [],
  });
});

it('infers flex if items-center exists', () => {
  expect(
    rewriteInferFlex({
      tag: 'Box',
      attributes: {
        class: 'items-center',
      },
      children: [],
    }),
  ).toEqual({
    tag: 'Box',
    attributes: {
      class: 'flex items-center',
    },
    children: [],
  });
});

it('adds position:relative if there is an absolute positioned child', () => {
  expect(
    rewritePositionedParent({
      tag: 'Box',
      attributes: {},
      children: [
        {
          tag: 'Image',
          attributes: {
            class: 'absolute',
          },
          children: [],
        },
      ],
    }),
  ).toEqual({
    tag: 'Box',
    attributes: {
      class: 'relative',
    },
    children: [
      {
        tag: 'Image',
        attributes: {
          class: 'absolute',
        },
        children: [],
      },
    ],
  });
});

it('moves children out of image', () => {
  expect(
    rewriteImagesWithChildren({
      tag: 'Box',
      attributes: {},
      children: [
        '1',
        {
          tag: 'Image',
          attributes: {},
          children: ['2'],
        },
        '3',
      ],
    }),
  ).toEqual({
    tag: 'Box',
    attributes: {},
    children: [
      '1',
      {
        tag: 'Image',
        attributes: {},
        children: [],
      },
      '2',
      '3',
    ],
  });
});
