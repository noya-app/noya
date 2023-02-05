import {
  filterSlashCommands,
  parseBlock,
  ParsedBlockItem,
  ParsedCompositeBlock,
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
