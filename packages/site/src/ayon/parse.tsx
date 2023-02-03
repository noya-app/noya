import { SystemProps, theme } from '@chakra-ui/react';
import { partition } from 'noya-utils';

export type ParseBlockTextOptions = {
  type: 'regular' | 'newlineSeparated' | 'commaSeparated';
  positionalItemNames?: string[];
};

export type ParsedBlockItemParameters = Record<string, string | boolean>;

export type ParsedBlockItem = {
  keyword?: string;
  content: string;
  parameters: ParsedBlockItemParameters;
};

export type ParsedBlock = {
  content: string;
  positionalItems: ParsedBlockItem[];
  globalParameters: ParsedBlockItemParameters;
};

function splitLines(text: string) {
  return text.split(/\r?\n/).map((item) => item.trim());
}

export function parseBlockLine(text: string): ParsedBlockItem {
  const active = text.startsWith('*');

  if (active) {
    text = text.slice(1);
  }

  const withHashtags = extractHashtagParameters(text);

  return {
    content: withHashtags.content,
    parameters: {
      ...(active && { active }),
      ...withHashtags.parameters,
    },
  };
}

export function parseBlock(
  text: string,
  options: ParseBlockTextOptions,
): ParsedBlock {
  text = filterSlashCommands(text);

  switch (options.type) {
    case 'newlineSeparated':
      const positionalItems = splitLines(text).map(parseBlockLine);

      const [nonEmptyItems, emptyItems] = partition(
        positionalItems,
        (item) => item.content !== '',
      );

      const globalParameters: ParsedBlockItemParameters = Object.assign(
        {},
        ...emptyItems.map((item) => item.parameters),
      );

      // We include empty positional items to preserve empty lines between lines with content.
      // Empty lines at the end are still trimmed
      const content = positionalItems
        .map((item) => item.content)
        .join('\n')
        .trimEnd();

      return {
        content,
        positionalItems: nonEmptyItems,
        globalParameters,
      };
    case 'commaSeparated':
      return {
        content: text,
        positionalItems: [],
        globalParameters: {},
      };
    // return text.split(',');
    default:
      return {
        content: text,
        positionalItems: [],
        globalParameters: {},
      };
  }
}

export function extractHashtagParameters(text: string) {
  const parameters: ParsedBlockItemParameters = {};

  text = text.replaceAll(
    /#([A-Za-z0-9-]*)(=[A-Za-z0-9-]*)?/g,
    (match, arg1, arg2) => {
      if (arg2) {
        parameters[arg1] = arg2.slice(1);
      } else {
        parameters[arg1] = true;
      }

      return '';
    },
  );

  return {
    content: text.trim(),
    parameters,
  };
}

export function filterSlashCommands(text: string) {
  return text.replaceAll(/\/[A-Za-z0-9\\-]*/g, '');
}

export function filterHashTagsAndSlashCommands(text: string = ''): {
  content: string;
  hashTags: string[];
  slashCommands: string[];
} {
  const lines = text.split(/\r?\n/);
  const words = lines.map((line) => line.split(' ')).flat();
  const content = words
    .filter((word) => !word.startsWith('#') && !word.startsWith('/'))
    .join(' ')
    .trim();
  const hashTags = words
    .filter((word) => word.startsWith('#'))
    .map((word) => word.slice(1).trim());
  const slashCommands = words
    .filter((word) => word.startsWith('/'))
    .map((word) => word.slice(1).trim());

  return {
    content,
    hashTags,
    slashCommands,
  };
}

export function filterTextPropertyHashTags(text?: string): {
  content?: string;
  hashTags: string[];
  color?: string;
  colorScheme?: string;
  fontWeight?: string;
  fontSize?: string;
  align?: string;
  textAlign?: SystemProps['textAlign'];
} {
  const { content, hashTags } = filterHashTagsAndSlashCommands(text);
  const colorByHashTag = hashTags?.find((hashTag) =>
    CSS.supports('color', hashTag),
  );
  const colorByHashTagHex = hashTags
    ?.map((hashTag) => `#${hashTag}`)
    .find((hashTag) => CSS.supports('color', hashTag));
  const color = colorByHashTag ?? colorByHashTagHex;
  const colorScheme = hashTags?.find((hashTag) =>
    Object.keys(theme.colors).includes(hashTag),
  );
  const fontWeight = hashTags?.find((hashTag) =>
    Object.keys(theme.fontWeights).includes(hashTag),
  );
  const fontSize = hashTags?.find((hashTag) =>
    Object.keys(theme.fontSizes).includes(hashTag),
  );
  const align = hashTags?.find((hashTag) =>
    ['left', 'center', 'right'].includes(hashTag),
  );
  const textAlign = hashTags?.find((hashTag) =>
    ['left', 'center', 'right'].includes(hashTag),
  ) as SystemProps['textAlign'];
  return {
    content,
    hashTags,
    color,
    colorScheme,
    fontWeight,
    fontSize,
    align,
    textAlign,
  };
}
