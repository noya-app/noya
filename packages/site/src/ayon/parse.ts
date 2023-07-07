export type ParsedBlockItemParameters = Record<string, boolean>;

export type ParsedBlockItem = {
  content: string;
  parameters: ParsedBlockItemParameters;
};

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
