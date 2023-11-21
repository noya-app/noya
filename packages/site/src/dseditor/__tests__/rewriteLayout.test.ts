import { layoutNode } from 'noya-compiler';
import {
  replaceHTMLEntities,
  rewriteAbsoluteFill,
  rewriteAutoDarkMode,
  rewriteBackgroundImageStyleToGradient,
  rewriteBoxToCard,
  rewriteBreakpointClasses,
  rewriteCardPadding,
  rewriteClassesKeepLastInGroup,
  rewriteConsistentSpacing,
  rewriteFlex1ButtonInColumn,
  rewriteForbiddenClassGroups,
  rewriteHTMLEntities,
  rewriteIconSize,
  rewriteImageToIcon,
  rewriteImagesWithChildren,
  rewriteInferFlex,
  rewriteInlineFlexButtonAndLink,
  rewriteMarginsInLayoutWithGap,
  rewritePositionedParent,
  rewriteRemoveHiddenElements,
  rewriteRemoveUselessClasses,
  rewriteRootClasses,
  rewriteTailwindClasses,
  rewriteVideoElement,
  unescapeHTML,
} from '../rewriteLayout';

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
    rewriteTailwindClasses(layoutNode('Box', { class: 'space-x-5' })),
  ).toEqual(layoutNode('Box', { class: 'gap-5 flex flex-row' }));
  expect(
    rewriteTailwindClasses(layoutNode('Box', { class: 'space-y-5' })),
  ).toEqual(layoutNode('Box', { class: 'gap-5 flex flex-col' }));
});

it('adds flex-1 to root', () => {
  expect(rewriteRootClasses(layoutNode('Box'))).toEqual(
    layoutNode('Box', { class: 'relative flex-1' }),
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
  expect(
    rewriteForbiddenClassGroups(layoutNode('button', { class: 'bg-blue-500' })),
  ).toEqual(layoutNode('button'));
  expect(
    rewriteForbiddenClassGroups(layoutNode('button', { class: 'border-2' })),
  ).toEqual(layoutNode('button'));
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

it('adds inline-flex and gap-2 to buttons with multiple children', () => {
  expect(
    rewriteInlineFlexButtonAndLink(
      layoutNode('Box', {}, [
        layoutNode('Button', {}, [layoutNode('Text')]),
        layoutNode('Button', {}, [layoutNode('Text'), layoutNode('Text')]),
        layoutNode('Button', {}, [
          layoutNode('Text'),
          layoutNode('Text'),
          layoutNode('Text'),
        ]),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', {}, [
      layoutNode('Button', {}, [layoutNode('Text')]),
      layoutNode('Button', { class: 'inline-flex gap-2' }, [
        layoutNode('Text'),
        layoutNode('Text'),
      ]),
      layoutNode('Button', { class: 'inline-flex gap-2' }, [
        layoutNode('Text'),
        layoutNode('Text'),
        layoutNode('Text'),
      ]),
    ]),
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

it('removes hidden elements', () => {
  expect(
    rewriteRemoveHiddenElements(
      layoutNode('Box', {}, [
        layoutNode('Box'),
        layoutNode('Box', { class: 'hidden' }),
        layoutNode('Box', { class: 'flex' }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', {}, [
      layoutNode('Box'),
      layoutNode('Box', { class: 'flex' }),
    ]),
  );

  expect(
    rewriteRemoveHiddenElements(
      layoutNode('Box', {}, [layoutNode('Box', { class: 'overflow-hidden' })]),
    ),
  ).toEqual(
    layoutNode('Box', {}, [layoutNode('Box', { class: 'overflow-hidden' })]),
  );
});

it('adds padding to cards', () => {
  expect(rewriteCardPadding(layoutNode('Card'))).toEqual(
    layoutNode('Card', { class: 'flex-col gap-4' }),
  );
  expect(rewriteCardPadding(layoutNode('Card', { class: 'p-2' }))).toEqual(
    layoutNode('Card', { class: 'p-2 flex-col gap-4' }),
  );
  expect(
    rewriteConsistentSpacing(
      rewriteCardPadding(layoutNode('Card', { class: 'gap-2 flex-row' })),
    ),
  ).toEqual(layoutNode('Card', { class: 'gap-4 flex-row' }));
});

it('converts boxes to cards', () => {
  const implicitCard = 'p-4 border';
  expect(rewriteBoxToCard(layoutNode('Box', { class: implicitCard }))).toEqual(
    layoutNode('Card', { class: implicitCard }),
  );
  expect(
    rewriteForbiddenClassGroups(
      rewriteBoxToCard(layoutNode('Box', { class: 'p-2 border' })),
    ),
  ).toEqual(layoutNode('Card'));
  expect(
    rewriteBoxToCard(
      layoutNode('Box', { class: implicitCard }, [
        layoutNode('Box', { class: implicitCard }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', { class: implicitCard }, [
      layoutNode('Card', { class: implicitCard }),
    ]),
  );
  expect(
    rewriteBoxToCard(
      layoutNode('Card', { class: implicitCard }, [
        layoutNode('Box', { class: implicitCard }),
      ]),
    ),
  ).toEqual(
    layoutNode('Card', { class: implicitCard }, [
      layoutNode('Box', { class: implicitCard }),
    ]),
  );
  expect(
    rewriteBoxToCard(
      layoutNode('Box', { class: implicitCard }, [
        layoutNode('Card', { class: implicitCard }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', { class: implicitCard }, [
      layoutNode('Card', { class: implicitCard }),
    ]),
  );
  expect(rewriteBoxToCard(layoutNode('Box', { name: 'Example Card' }))).toEqual(
    layoutNode('Card', { name: 'Example Card' }),
  );
  expect(rewriteBoxToCard(layoutNode('Box', { name: 'Card Title' }))).toEqual(
    layoutNode('Box', { name: 'Card Title' }),
  );
});

it('keeps last class in group', () => {
  expect(
    rewriteClassesKeepLastInGroup(
      layoutNode('Box', { class: 'absolute relative' }),
    ),
  ).toEqual(layoutNode('Box', { class: 'relative' }));
});

it('rewrites breakpoint classes', () => {
  expect(
    rewriteBreakpointClasses(layoutNode('Box', { class: 'sm:p-4' })),
  ).toEqual(layoutNode('Box', { class: 'p-4' }));
  expect(
    rewriteBreakpointClasses(layoutNode('Box', { class: 'md:p-4' })),
  ).toEqual(layoutNode('Box', { class: 'p-4' }));
  expect(
    rewriteBreakpointClasses(layoutNode('Box', { class: 'lg:p-4' })),
  ).toEqual(layoutNode('Box'));
  expect(
    rewriteBreakpointClasses(layoutNode('Box', { class: 'xl:p-4' })),
  ).toEqual(layoutNode('Box'));
  expect(
    rewriteBreakpointClasses(layoutNode('Box', { class: '2xl:p-4' })),
  ).toEqual(layoutNode('Box'));
});

it('removes margin (along primary axis) from children of parents with gap', () => {
  expect(
    rewriteMarginsInLayoutWithGap(
      layoutNode('Box', { class: 'flex flex-col gap-4' }, [
        layoutNode('Box', { class: 'm-4' }),
        layoutNode('Box', { class: 'mt-4' }),
      ]),
    ),
  ).toEqual(
    layoutNode('Box', { class: 'flex flex-col gap-4' }, [
      layoutNode('Box', { class: 'm-4' }),
      layoutNode('Box'),
    ]),
  );
});

it('rewrites colors for dark mode', () => {
  expect(
    rewriteAutoDarkMode(layoutNode('Box', { class: 'bg-gray-50' })),
  ).toEqual(layoutNode('Box', { class: 'bg-gray-50 dark:bg-gray-950' }));
  expect(
    rewriteAutoDarkMode(layoutNode('Box', { class: 'text-black' })),
  ).toEqual(layoutNode('Box', { class: 'text-black dark:text-white' }));
});

it('removes useless classes', () => {
  expect(
    rewriteRemoveUselessClasses(layoutNode('Box', { class: 'foo dark:foo' })),
  ).toEqual(layoutNode('Box'));
});

it('replaces background image with gradient', () => {
  expect(
    rewriteBackgroundImageStyleToGradient(
      layoutNode('Box', {
        style: {
          backgroundImage: 'url("https://example.com/image.png")',
        },
      }),
    ),
  ).toEqual(
    layoutNode('Box', {
      class: 'bg-gradient-to-r from-primary-300 to-primary-700',
    }),
  );
});

it('replaces video element', () => {
  expect(rewriteVideoElement(layoutNode('video'))).toEqual(
    layoutNode(
      'Box',
      {
        name: 'Video Container',
        class: 'bg-black flex flex-col justify-center items-center',
      },
      [
        layoutNode('Icon', {
          name: 'Play Icon',
          alt: 'play',
          class: 'bg-white w-10 h-10 rounded-full',
        }),
      ],
    ),
  );
});
