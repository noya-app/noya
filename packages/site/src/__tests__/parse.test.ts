import { filterSlashCommands, parseBlock, ParsedBlock } from '../ayon/parse';

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

test('newline separated', () => {
  expect(
    parseBlock(sidebarText, {
      type: 'newlineSeparated',
    }),
  ).toEqual<ParsedBlock>({
    content: 'Dashboard\nUpdates\n\nProjects',
    positionalItems: [
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
  });
});
