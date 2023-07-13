import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { readFileSync } from 'fs';
import {
  clean,
  compile,
  createElementCode,
  mapBlockToElement,
  print,
} from 'noya-compiler';
import Sketch from 'noya-file-format';
import { loadDesignSystem } from 'noya-module-loader';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { symbolMap } from '../ayon/blocks/blocks';
import {
  buttonSymbolId,
  cardSymbolId,
  checkboxSymbolId,
  heroSymbolV2Id,
  iconSymbolId,
  imageSymbolId,
  linkSymbolId,
  textSymbolId,
} from '../ayon/symbols/symbolIds';

jest.setTimeout(20000);

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

let ChakraDesignSystem: DesignSystemDefinition;
let MaterialDesignSystem: DesignSystemDefinition;

beforeAll(async () => {
  ChakraDesignSystem = await loadDesignSystem('chakra');
  MaterialDesignSystem = await loadDesignSystem('mui');
});

function generate(
  symbol: Sketch.SymbolInstance,
  DesignSystem = ChakraDesignSystem,
) {
  return clean(
    print(
      createElementCode(
        mapBlockToElement({ symbolMap, DesignSystem }, symbol)!,
      ),
    ),
  );
}

describe('button', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: buttonSymbolId,
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('text', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: textSymbolId,
      blockText: 'Hello world #center #text-red-500',
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });

  test('escape jsx', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: textSymbolId,
      blockText: 'Hello "\'<{test}>\'" world',
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('link', () => {
  // TODO: Icon doesn't get added to exported code
  test('with icon', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: linkSymbolId,
      blockText: 'Test #icon-arrow-right',
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('icon', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: iconSymbolId,
      frame: SketchModel.rect({
        width: 48,
        height: 48,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });

  test('with color', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: iconSymbolId,
      blockText: '#fill-blue-400',
      frame: SketchModel.rect({
        width: 48,
        height: 48,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('hero', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: heroSymbolV2Id,
      frame: SketchModel.rect({
        width: 400,
        height: 400,
      }),
    });

    expect(generate(symbol)).toMatchSnapshot();
  });

  test('left aligned', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: heroSymbolV2Id,
      frame: SketchModel.rect({
        width: 400,
        height: 400,
      }),
      blockText: '#left',
    });

    expect(generate(symbol)).toMatchSnapshot();
  });

  test('with bg', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: heroSymbolV2Id,
      frame: SketchModel.rect({
        width: 400,
        height: 400,
      }),
      blockText: '#bg-blue-500',
    });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('card with no border radius on image', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: cardSymbolId,
      frame: SketchModel.rect({
        width: 300,
        height: 400,
      }),
    });

    symbolMap[symbol.symbolID].layers
      .filter(Layers.isSymbolInstance)
      .filter((layer) => layer.symbolID === imageSymbolId)
      .forEach((layer) => {
        symbol.overrideValues.push(
          SketchModel.overrideValue({
            overrideName: Overrides.encodeName(
              [layer.do_objectID],
              'resolvedBlockData',
            ),
            value: {
              symbolID: layer.symbolID,
              originalText: 'cat',
              resolvedText: 'https://placekitten.com/300/300',
            },
          }),
        );
        symbol.overrideValues.push(
          SketchModel.overrideValue({
            overrideName: Overrides.encodeName(
              [layer.do_objectID],
              'blockText',
            ),
            value: 'cat #rounded-none',
          }),
        );
      });

    expect(generate(symbol)).toMatchSnapshot();
  });
});

describe('element as prop', () => {
  test('default', () => {
    const symbol = SketchModel.symbolInstance({
      symbolID: checkboxSymbolId,
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
      blockText: 'Hello world',
    });

    expect(generate(symbol, MaterialDesignSystem)).toMatchSnapshot();
  });
});

describe('generate file', () => {
  test('chakra', async () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        width: 100,
        height: 100,
      }),
    });

    expect(
      await compile({
        name: 'My App',
        artboard,
        symbolMap,
        DesignSystem: ChakraDesignSystem,
        target: 'standalone',
      }),
    ).toMatchSnapshot();
  });

  test('mui', async () => {
    const checkbox = SketchModel.symbolInstance({
      symbolID: checkboxSymbolId,
      frame: SketchModel.rect({
        width: 100,
        height: 40,
      }),
      blockText: 'Hello world',
    });

    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        width: 100,
        height: 100,
      }),
      layers: [checkbox],
    });

    expect(
      await compile({
        name: 'My App',
        artboard,
        symbolMap,
        DesignSystem: MaterialDesignSystem,
        target: 'standalone',
      }),
    ).toMatchSnapshot();
  });
});
