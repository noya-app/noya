import {
  filterSlashCommands,
  getGlobalBlockParameters,
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
#globalParameter
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
  },
};

test('newline separated', () => {
  expect(parseBlock(sidebarText, 'newlineSeparated')).toEqual(sidebarBlock);
});

test('get global block parameters', () => {
  expect(
    getGlobalBlockParameters(sidebarBlock, (key) =>
      ['active', 'globalParameter'].includes(key),
    ),
  ).toEqual({
    active: true,
    globalParameter: true,
  });
});

const headerbarText = `Home #booleanParameter, *Projects ,     Team
#globalParameter
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
