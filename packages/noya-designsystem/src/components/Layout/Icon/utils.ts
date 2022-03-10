interface GlyphMap {
  [name: string]: number;
}

type Icon =
  | any
  | {
      properties: {
        name: string;
        code: number;
      };
    };

export interface SelectionFileMinimal {
  icons: Icon[];
}

export function createGlyphsMap(selectionFile: SelectionFileMinimal) {
  const ghlyps: GlyphMap = {};

  selectionFile.icons.forEach((icon) => {
    if ('properties' in icon) {
      ghlyps[icon.properties.name] = icon.properties.code.toString(16);
    }
  });

  return ghlyps;
}
