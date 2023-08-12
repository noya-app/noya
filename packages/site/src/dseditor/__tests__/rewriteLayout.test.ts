import { readFileSync } from 'fs';
import { layoutNode } from 'noya-compiler';
import path from 'path';
import {
  rewriteAbsoluteFill,
  rewriteImagesWithChildren,
  rewriteInferFlex,
  rewritePositionedParent,
  rewriteRootClasses,
  rewriteTailwindClasses,
} from '../rewriteLayout';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../../safelist.txt', () => {
  return {
    default: readFileSync(
      path.join(__dirname, '../../../safelist.txt'),
      'utf8',
    ),
  };
});

it('replaces grow with flex-1', () => {
  expect(rewriteTailwindClasses(layoutNode('Box', { class: 'grow' }))).toEqual(
    layoutNode('Box', { class: 'flex-1' }),
  );
});

it('adds flex-1 to root', () => {
  expect(rewriteRootClasses(layoutNode('Box'))).toEqual(
    layoutNode('Box', { class: 'flex-1' }),
  );
});

it('infers flex if items-center exists', () => {
  expect(
    rewriteInferFlex(layoutNode('Box', { class: 'items-center' })),
  ).toEqual(layoutNode('Box', { class: 'flex items-center' }));
});

it('adds position:relative if there is an absolute positioned child', () => {
  expect(
    rewritePositionedParent(
      layoutNode('Box', {}, [layoutNode('Image', { class: 'absolute' })]),
    ),
  ).toEqual(
    layoutNode('Box', { class: 'relative' }, [
      layoutNode('Image', { class: 'absolute' }),
    ]),
  );
});

it("doesn't add position:relative if the parent is positioned", () => {
  expect(
    rewritePositionedParent(
      layoutNode('Box', { class: 'absolute' }, [
        layoutNode('Image', { class: 'absolute' }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', { class: 'absolute' }, [
      layoutNode('Image', { class: 'absolute' }),
    ]),
  );
});

it('moves children out of image', () => {
  expect(
    rewriteImagesWithChildren(
      layoutNode('Box', {}, ['1', layoutNode('Image', {}, ['2']), '3']),
    ),
  ).toEqual(layoutNode('Box', {}, ['1', layoutNode('Image'), '2', '3']));
});

it('moves absolute fill children and sets other children to position relative', () => {
  expect(
    rewriteAbsoluteFill(
      layoutNode('Box', {}, [
        layoutNode('Box'),
        layoutNode('Image', { class: 'absolute w-full h-full' }),
        layoutNode('Text', { class: 'absolute' }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', {}, [
      layoutNode('Image', { class: 'absolute w-full h-full' }),
      layoutNode('Box', { class: 'relative' }),
      layoutNode('Text', { class: 'absolute' }),
    ]),
  );
});
