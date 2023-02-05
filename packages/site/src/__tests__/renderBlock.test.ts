import * as ChakraUI from '@chakra-ui/react';
import { readFileSync } from 'fs';
import { createElement, createElementCode, format, print } from 'noya-compiler';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import path from 'path';
import { Blocks } from '../ayon/blocks';
import { buttonSymbolId, textSymbolId } from '../ayon/blocks/symbols';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

const Components = new Map<unknown, string>();

Object.entries(ChakraUI).forEach(([key, value]) => {
  Components.set(value, key);
});

function generate(symbol: Sketch.SymbolInstance) {
  return format(
    print(createElementCode(createElement({ Blocks, Components }, symbol)!)),
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
});
