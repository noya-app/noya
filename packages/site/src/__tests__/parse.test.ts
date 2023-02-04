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
        booleanParameter: true,
        keywordParameter: 'value',
      },
    },
    {
      content: 'Updates',
      parameters: {},
    },
    {
      content: 'Projects',
      parameters: {},
    },
  ],
  globalParameters: {
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
    globalParameters: {},
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
    globalParameters: {
      dark: true,
    },
  });
});

test('list item parameters to global', () => {
  expect(
    parseBlock(
      'Dashboard #booleanParameter #dark\nPlatform',
      'newlineSeparated',
      {
        isGlobalParameter: (parameter) => parameter === 'dark',
      },
    ),
  ).toEqual<ParsedCompositeBlock>({
    content: 'Dashboard\nPlatform',
    items: [
      {
        content: 'Dashboard',
        parameters: {
          booleanParameter: true,
        },
      },
      {
        content: 'Platform',
        parameters: {},
      },
    ],
    globalParameters: {
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
        parameters: {
          booleanParameter: true,
        },
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
    globalParameters: {
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
    globalParameters: {
      dark: true,
    },
  });
});

test('comma separated with placeholder', () => {
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
    globalParameters: {
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
