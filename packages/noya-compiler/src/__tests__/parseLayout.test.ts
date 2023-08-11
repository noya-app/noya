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
