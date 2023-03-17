import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { readFileSync } from 'fs';
import {
  compile,
  createElement,
  createElementCode,
  format,
  print,
} from 'noya-compiler';
import Sketch from 'noya-file-format';
import { loadDesignSystem } from 'noya-module-loader';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { Blocks } from '../ayon/blocks/blocks';
import {
  buttonSymbolId,
  cardSymbolId,
  heroSymbolV2Id,
  iconSymbolId,
  imageSymbolId,
  linkSymbolId,
  textSymbolId,
} from '../ayon/blocks/symbolIds';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

let DesignSystem: DesignSystemDefinition;

beforeAll(async () => {
  DesignSystem = await loadDesignSystem('chakra');
});

function generate(symbol: Sketch.SymbolInstance) {
  return format(
    print(createElementCode(createElement({ Blocks, DesignSystem }, symbol)!)),
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

    Blocks[symbol.symbolID].symbol.layers
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

describe('generate file', () => {
  test('base', async () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        width: 100,
        height: 100,
      }),
    });

    expect(
      await compile({
        artboard,
        Blocks,
        DesignSystem,
        target: 'standalone',
      }),
    ).toMatchSnapshot();
  });
});
