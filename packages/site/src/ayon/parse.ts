import { SystemProps, theme } from '@chakra-ui/react';

export type ParsedBlockItemParameters = Record<string, string | boolean>;

export type ParsedBlockItem = {
  content: string;
  parameters: ParsedBlockItemParameters;
};

export type ParsedCompositeBlock = {
  content: string;
  items: ParsedBlockItem[];
  globalParameters: ParsedBlockItemParameters;
};

type ParsedBlockTypeMap = {
  regular: ParsedBlockItem;
  newlineSeparated: ParsedCompositeBlock;
  commaSeparated: ParsedCompositeBlock;
};

function mergeObjects<T extends object>(objects: T[]): T {
  return Object.assign({}, ...objects);
}

function splitItems(text: string, type: 'commaSeparated' | 'newlineSeparated') {
  const items = text.split(type === 'commaSeparated' ? /,\s*/ : /\r?\n/);

  return items.map((item) => item.trim());
}

export function parseBlockItem(text: string): ParsedBlockItem {
  text = text.trim();

  const active = text.startsWith('*');

  if (active) {
    text = text.slice(1);
  }

  return {
    content: text,
    parameters: {
      ...(active && { active }),
    },
  };
}

function parseBlockInner<K extends keyof ParsedBlockTypeMap>(
  text: string = '',
  type: K,
): ParsedBlockTypeMap[K] {
  text = filterSlashCommands(text);

  const extracted = extractHashtagParameters(text);

  text = extracted.content;

  const globalParameters = extracted.parameters;

  switch (type) {
    case 'newlineSeparated': {
      const items = splitItems(text, 'newlineSeparated').map(parseBlockItem);

      // We include empty positional items to preserve empty lines between lines with content.
      // Empty lines at the end are still trimmed
      const content = items
        .map((item) => item.content)
        .join('\n')
        .trimEnd();

      const block: ParsedCompositeBlock = {
        content,
        items,
        globalParameters,
      };

      return block as ParsedBlockTypeMap[K];
    }
    case 'commaSeparated': {
      const lines = splitItems(text, 'newlineSeparated');

      const items = splitItems(lines[0], 'commaSeparated').map(parseBlockItem);

      // If there's only one positional item and it's empty, ignore it
      if (items.length === 1 && items[0].content === '') {
        const block: ParsedCompositeBlock = {
          content: '',
          items: [],
          globalParameters,
        };

        return block as ParsedBlockTypeMap[K];
      }

      const block: ParsedCompositeBlock = {
        content: items.map((item) => item.content).join(','),
        items,
        globalParameters,
      };

      return block as ParsedBlockTypeMap[K];
    }
    case 'regular': {
      const item = parseBlockItem(text);

      const block: ParsedBlockItem = {
        content: item.content,
        parameters: mergeObjects([globalParameters, item.parameters]),
      };

      return block as ParsedBlockTypeMap[K];
    }
    default: {
      throw new Error('Invalid block parse type');
    }
  }
}

export function parseBlock<K extends keyof ParsedBlockTypeMap>(
  text: string = '',
  type: K,
  {
    placeholder,
  }: {
    placeholder?: string;
  } = {},
): ParsedBlockTypeMap[K] {
  switch (type) {
    case 'regular': {
      return parseBlockInner(text, type);
    }
    case 'commaSeparated':
    case 'newlineSeparated': {
      const block = parseBlockInner(text, type) as ParsedCompositeBlock;

      // If empty or parameters-only, merge placeholder content into the block
      if (placeholder && block.content === '') {
        const parsedPlaceholder = parseBlockInner(
          placeholder,
          type,
        ) as ParsedCompositeBlock;

        block.content = parsedPlaceholder.content;
        block.items = parsedPlaceholder.items;
        block.globalParameters = mergeObjects([
          parsedPlaceholder.globalParameters,
          block.globalParameters,
        ]);
      }

      return block as ParsedBlockTypeMap[K];
    }
    default: {
      throw new Error('Invalid block parse type');
    }
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
