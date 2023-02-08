export type ParsedBlockParameter = string | boolean;

export type ParsedBlockItemParameters = Record<string, ParsedBlockParameter>;

export type ParsedBlockItem = {
  content: string;
  parameters: ParsedBlockItemParameters;
};

export type ParsedCompositeBlock = {
  content: string;
  items: ParsedBlockItem[];
  parameters: ParsedBlockItemParameters;
};

export type ParsedTableBlock = {
  content: string;
  rows: ParsedCompositeBlock[];
  parameters: ParsedBlockItemParameters;
};

type ParsedBlockTypeMap = {
  regular: ParsedBlockItem;
  newlineSeparated: ParsedCompositeBlock;
  commaSeparated: ParsedCompositeBlock;
  table: ParsedTableBlock;
};

export type ParsedBlockType = keyof ParsedBlockTypeMap;

function mergeObjects<T extends object>(objects: T[]): T {
  return Object.assign({}, ...objects);
}

function splitItems(text: string, type: 'commaSeparated' | 'newlineSeparated') {
  const items = text.split(type === 'commaSeparated' ? /[,\t]\s*/ : /\r?\n/);

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

  const parameters = extracted.parameters;

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
        parameters: parameters,
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
          parameters: parameters,
        };

        return block as ParsedBlockTypeMap[K];
      }

      const block: ParsedCompositeBlock = {
        content: items.map((item) => item.content).join(','),
        items,
        parameters: parameters,
      };

      return block as ParsedBlockTypeMap[K];
    }
    case 'regular': {
      const item = parseBlockItem(text);

      const block: ParsedBlockItem = {
        content: item.content,
        parameters: mergeObjects([parameters, item.parameters]),
      };

      return block as ParsedBlockTypeMap[K];
    }
    case 'table': {
      const lines = splitItems(text, 'newlineSeparated');

      const rows = lines.map((line) => parseBlockInner(line, 'commaSeparated'));

      const block: ParsedTableBlock = {
        content: rows.map((row) => row.content).join('\n'),
        rows,
        parameters,
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
        block.parameters = mergeObjects([
          parsedPlaceholder.parameters,
          block.parameters,
        ]);
      }

      return block as ParsedBlockTypeMap[K];
    }
    case 'table': {
      const block = parseBlockInner(text, type) as ParsedTableBlock;

      // If empty or parameters-only, merge placeholder content into the block
      if (placeholder && block.content === '') {
        const parsedPlaceholder = parseBlockInner(
          placeholder,
          type,
        ) as ParsedTableBlock;

        block.content = parsedPlaceholder.content;
        block.rows = parsedPlaceholder.rows;
        block.parameters = mergeObjects([
          parsedPlaceholder.parameters,
          block.parameters,
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

const urlRegex = /https?:\/\/(?:www\.)?\S*/g;
const slashRegex = /\/[-a-zA-Z0-9]*/g;

export function filterSlashCommands(text: string) {
  const urlMatches = [...text.matchAll(urlRegex)];
  const slashMatches = [...text.matchAll(slashRegex)].reverse();

  for (const match of slashMatches) {
    // If the slash command is inside a URL, ignore it
    if (
      urlMatches.some(
        (urlMatch) =>
          urlMatch.index !== undefined &&
          match.index !== undefined &&
          match.index >= urlMatch.index &&
          match.index <= urlMatch.index + urlMatch[0].length,
      )
    ) {
      continue;
    }

    if (match.index !== undefined && match.index > 0) {
      const previousCharacter = text[match.index - 1];

      if (previousCharacter === '/' || previousCharacter === ':') {
        continue;
      }
    }

    text = text.replace(match[0], '');
  }

  return text;
}

export function getTextAlign({
  left,
  right,
  center,
}: ParsedBlockItemParameters) {
  return left ? 'left' : right ? 'right' : center ? 'center' : undefined;
}
