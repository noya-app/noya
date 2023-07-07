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

const textAlignKeys = new Set(['left', 'right', 'center']);

export function getTextAlign(hashtags: string[]) {
  const textAlignKey = hashtags
    .slice()
    .reverse()
    .find((key) => textAlignKeys.has(key)) as
    | 'left'
    | 'right'
    | 'center'
    | undefined;

  return textAlignKey;
}

export function getSelfAlign({
  left,
  right,
  center,
}: ParsedBlockItemParameters) {
  return left
    ? 'self-start'
    : right
    ? 'self-end'
    : center
    ? 'self-center'
    : undefined;
}

export function encodeBlockItem(blockItem: ParsedBlockItem) {
  const { content, parameters } = blockItem;

  const encodedParameters = Object.entries(parameters).map(([key, value]) => {
    if (value === true) {
      return `#${key}`;
    } else {
      return `#${key}=${value}`;
    }
  });

  return [content, ...encodedParameters].filter((x) => !!x).join(' ');
}
