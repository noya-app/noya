import { SystemProps, theme } from '@chakra-ui/react';

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
