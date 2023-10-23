import { LayoutNode, parseComponentLayout } from '../parseComponentLayout';

it('parses self-closing', () => {
  // example with comment
  expect(
    parseComponentLayout(`
    <Image />
  `),
  ).toEqual<LayoutNode>({
    tag: 'Image',
    attributes: {},
    children: [],
  });
});

it('removes comments', () => {
  // example with comment
  expect(
    parseComponentLayout(`
    <Box>
      <!-- comment -->
      <Button>Click me</Button>
      <!-- comment -->
    </Box>
  `),
  ).toEqual<LayoutNode>({
    tag: 'Box',
    attributes: {},
    children: [
      {
        tag: 'Button',
        attributes: {},
        children: ['Click me'],
      },
    ],
  });
});

it('parses data attributes', () => {
  expect(
    parseComponentLayout(`
    <div name="test" [data-tab-active="Tab 1"]>
      Content
    </div>
  `),
  ).toEqual<LayoutNode>({
    tag: 'div',
    attributes: { name: 'test' },
    children: ['Content'],
  });
});

it('parses from code block', () => {
  expect(
    parseComponentLayout(`
    ${'```jsx'}
    <div name="test">
      Content
    </div>
    ${'```'}
  `),
  ).toEqual<LayoutNode>({
    tag: 'div',
    attributes: { name: 'test' },
    children: ['Content'],
  });
});

it('parses from unterminated code block', () => {
  expect(
    parseComponentLayout(`
    ${'```jsx'}
    <div name="test">
      Content
    </div>`),
  ).toEqual<LayoutNode>({
    tag: 'div',
    attributes: { name: 'test' },
    children: ['Content'],
  });
});
