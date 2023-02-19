import {
  filterSlashCommands,
  mergeBlockItems,
  parseBlock,
  ParsedBlockItem,
  ParsedCompositeBlock,
  ParsedTableBlock,
} from '../ayon/parse';

test('remove slash commands', () => {
  expect(filterSlashCommands('/hello ')).toEqual(' ');
  expect(filterSlashCommands('hello /world')).toEqual('hello ');
  expect(filterSlashCommands('hello\n\n/world 123')).toEqual('hello\n\n 123');
});

const sidebarText = `
*Dashboard #booleanParameter #keywordParameter=value
Updates

Projects
#globalParameter #globalParameter2
#globalParameter3
`.trim();

const sidebarBlock: ParsedCompositeBlock = {
  content: 'Dashboard\nUpdates\n\nProjects',
  items: [
    {
      content: 'Dashboard',
      parameters: {
        active: true,
      },
    },
    {
      content: 'Updates',
      parameters: {},
    },
    {
      content: '',
      parameters: {},
    },
    {
      content: 'Projects',
      parameters: {},
    },
  ],
  parameters: {
    booleanParameter: true,
    keywordParameter: 'value',
    globalParameter: true,
    globalParameter2: true,
    globalParameter3: true,
  },
};

test('newline separated', () => {
  expect(parseBlock(sidebarText, 'newlineSeparated')).toEqual(sidebarBlock);
});

test('newline separated with placeholder', () => {
  expect(
    parseBlock('', 'newlineSeparated', {
      placeholder: '*Dashboard',
    }),
  ).toEqual<ParsedCompositeBlock>({
    content: 'Dashboard',
    items: [
      {
        content: 'Dashboard',
        parameters: {
          active: true,
        },
      },
    ],
    parameters: {},
  });
});

test('newline separated with placeholder and global parameter', () => {
  expect(
    parseBlock('#dark', 'newlineSeparated', {
      placeholder: '*Dashboard',
    }),
  ).toEqual<ParsedCompositeBlock>({
    content: 'Dashboard',
    items: [
      {
        content: 'Dashboard',
        parameters: {
          active: true,
        },
      },
    ],
    parameters: {
      dark: true,
    },
  });
});

const headerbarText = `Home #booleanParameter, *Projects ,     Team
#globalParameter #globalParameter2
#globalParameter3
`.trim();

test('comma separated', () => {
  expect(
    parseBlock(headerbarText, 'commaSeparated'),
  ).toEqual<ParsedCompositeBlock>({
    content: 'Home,Projects,Team',
    items: [
      {
        content: 'Home',
        parameters: {},
      },
      {
        content: 'Projects',
        parameters: {
          active: true,
        },
      },
      {
        content: 'Team',
        parameters: {},
      },
    ],
    parameters: {
      booleanParameter: true,
      globalParameter: true,
      globalParameter2: true,
      globalParameter3: true,
    },
  });
});

test('comma separated parameters-only', () => {
  expect(parseBlock('#dark', 'commaSeparated')).toEqual<ParsedCompositeBlock>({
    content: '',
    items: [],
    parameters: {
      dark: true,
    },
  });
});

test('comma separated parameters-only with placeholder', () => {
  expect(
    parseBlock('#dark', 'commaSeparated', {
      placeholder: 'Home',
    }),
  ).toEqual<ParsedCompositeBlock>({
    content: 'Home',
    items: [
      {
        content: 'Home',
        parameters: {},
      },
    ],
    parameters: {
      dark: true,
    },
  });
});

const buttonText = `Hello #keywordParameter=value
#booleanParameter`;

test('regular block', () => {
  expect(parseBlock(buttonText, 'regular')).toEqual<ParsedBlockItem>({
    content: 'Hello',
    parameters: {
      booleanParameter: true,
      keywordParameter: 'value',
    },
  });
});

const imageText = 'http://localhost:31112/api/assets/cldt66zsr0006o21caj89335a';

test('regular block with url', () => {
  expect(parseBlock(imageText, 'regular')).toEqual<ParsedBlockItem>({
    content: imageText,
    parameters: {},
  });
});

const tableText = `
#globalParameter2 Name,Age,Twitter
John,28,@john
Jane,30,@jane
#globalParameter
`.trim();

test('table block', () => {
  expect(parseBlock(tableText, 'table')).toEqual<ParsedTableBlock>({
    content: `Name,Age,Twitter\nJohn,28,@john\nJane,30,@jane`,
    rows: [
      {
        content: 'Name,Age,Twitter',
        items: [
          { content: 'Name', parameters: {} },
          { content: 'Age', parameters: {} },
          { content: 'Twitter', parameters: {} },
        ],
        parameters: {},
      },
      {
        content: 'John,28,@john',
        items: [
          { content: 'John', parameters: {} },
          { content: '28', parameters: {} },
          { content: '@john', parameters: {} },
        ],
        parameters: {},
      },
      {
        content: 'Jane,30,@jane',
        items: [
          { content: 'Jane', parameters: {} },
          { content: '30', parameters: {} },
          { content: '@jane', parameters: {} },
        ],
        parameters: {},
      },
    ],
    parameters: {
      globalParameter: true,
      globalParameter2: true,
    },
  });
});

test('table block with tab delimiters', () => {
  expect(parseBlock(`Name\tAge\tTwitter`, 'table')).toEqual<ParsedTableBlock>({
    content: `Name,Age,Twitter`,
    rows: [
      {
        content: 'Name,Age,Twitter',
        items: [
          { content: 'Name', parameters: {} },
          { content: 'Age', parameters: {} },
          { content: 'Twitter', parameters: {} },
        ],
        parameters: {},
      },
    ],
    parameters: {},
  });
});

test('table block with placeholder', () => {
  expect(
    parseBlock('#globalParameter', 'table', {
      placeholder: 'Name,Age,Twitter',
    }),
  ).toEqual<ParsedTableBlock>({
    content: `Name,Age,Twitter`,
    rows: [
      {
        content: 'Name,Age,Twitter',
        items: [
          { content: 'Name', parameters: {} },
          { content: 'Age', parameters: {} },
          { content: 'Twitter', parameters: {} },
        ],
        parameters: {},
      },
    ],
    parameters: {
      globalParameter: true,
    },
  });
});

it('merges block items', () => {
  const merged = mergeBlockItems([
    { content: 'Dashboard', parameters: { a: true } },
    { content: 'Updates', parameters: { b: true } },
  ]);

  expect(merged).toEqual({
    content: 'Dashboard',
    parameters: { a: true, b: true },
  });

  // Parameter order matters
  expect(Object.keys(merged.parameters)).toEqual(['b', 'a']);
});

it('merges block items and preserves parameter order', () => {
  const merged = mergeBlockItems([
    { content: 'Dashboard', parameters: { a: true } },
    { content: '', parameters: { b: true } },
    { content: '', parameters: { a: true } },
  ]);

  expect(Object.keys(merged.parameters)).toEqual(['b', 'a']);
});
