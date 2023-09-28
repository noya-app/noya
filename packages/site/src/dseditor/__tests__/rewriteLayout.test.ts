import { readFileSync } from 'fs';
import { layoutNode } from 'noya-compiler';
import path from 'path';
import {
  replaceHTMLEntities,
  rewriteAbsoluteFill,
  rewriteConsistentSpacing,
  rewriteFlex1ButtonInColumn,
  rewriteForbiddenClassGroups,
  rewriteHTMLEntities,
  rewriteIconSize,
  rewriteImageToIcon,
  rewriteImagesWithChildren,
  rewriteInferFlex,
  rewritePositionedParent,
  rewriteRootClasses,
  rewriteTailwindClasses,
  unescapeHTML,
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

it('removes hallucinated classes', () => {
  expect(rewriteTailwindClasses(layoutNode('Box', { class: 'btn' }))).toEqual(
    layoutNode('Box'),
  );
});

it('replaces prohibited classes', () => {
  expect(
    rewriteTailwindClasses(
      layoutNode('Box', { class: 'transition duration-500' }),
    ),
  ).toEqual(layoutNode('Box', {}));
});

it('replaces space-y-5 with gap-5', () => {
  expect(
    rewriteTailwindClasses(layoutNode('Box', { class: 'space-y-5' })),
  ).toEqual(layoutNode('Box', { class: 'gap-5' }));
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

it('removes forbidden classes', () => {
  expect(
    rewriteForbiddenClassGroups(layoutNode('Button', { class: 'p-4' })),
  ).toEqual(layoutNode('Button'));
});

it('removes flex-1 from button in a flex-col', () => {
  expect(
    rewriteFlex1ButtonInColumn(
      layoutNode('Box', { class: 'flex flex-col' }, [
        layoutNode('Button', { class: 'flex-1' }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', { class: 'flex flex-col' }, [layoutNode('Button')]),
  );
});

it('adds w-6 and h-6 to icons without a size', () => {
  expect(rewriteIconSize(layoutNode('Icon'))).toEqual(
    layoutNode('Icon', { class: 'w-6 h-6' }),
  );
  expect(rewriteIconSize(layoutNode('Icon', { class: 'w-1/3' }))).toEqual(
    layoutNode('Icon', { class: 'w-1/3 h-6' }),
  );
  expect(rewriteIconSize(layoutNode('Icon', { class: 'h-1/3' }))).toEqual(
    layoutNode('Icon', { class: 'h-1/3 w-6' }),
  );
  expect(rewriteIconSize(layoutNode('Icon', { class: 'w-1/3 h-1/3' }))).toEqual(
    layoutNode('Icon', { class: 'w-1/3 h-1/3' }),
  );
});

it('convert images to icons if they contain "icon" or are icon-sized', () => {
  expect(rewriteImageToIcon(layoutNode('Image', { name: 'icon' }))).toEqual(
    layoutNode('Icon', { name: 'icon' }),
  );
  expect(
    rewriteImageToIcon(layoutNode('Image', { alt: 'Some Icon Test' })),
  ).toEqual(layoutNode('Icon', { alt: 'Some Icon Test' }));
  expect(rewriteImageToIcon(layoutNode('Image', { class: 'w-4 h-4' }))).toEqual(
    layoutNode('Icon', { class: 'w-4 h-4' }),
  );
});

it('normalizes spacing to 4 units', () => {
  expect(
    rewriteConsistentSpacing(layoutNode('Box', { class: 'p-3 gap-7' })),
  ).toEqual(layoutNode('Box', { class: 'p-4 gap-4' }));
});

it('unescapes html entities', () => {
  expect(unescapeHTML('&amp;')).toEqual('&');
  expect(unescapeHTML('  hello&lt;world  ')).toEqual('hello<world  ');

  expect(replaceHTMLEntities('  hello&lt;world  &amp;  ')).toEqual(
    '  hello<world  &  ',
  );

  expect(
    rewriteHTMLEntities(layoutNode('Text', {}, ['  hello&lt;world  '])),
  ).toEqual(layoutNode('Text', {}, ['  hello<world  ']));
});
