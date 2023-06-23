import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { Blocks } from '../ayon/blocks/blocks';
import { heading5SymbolId, heroSymbolV2Id } from '../ayon/blocks/symbolIds';
import {
  extractBlockContent,
  fromSymbol,
  toContent,
} from '../ayon/editor/serialization';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

test('serializes block', () => {
  const instance = SketchModel.symbolInstance({
    blockText: '',
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  const symbol = Blocks[instance.symbolID].symbol;

  const originalContent = extractBlockContent(instance);
  const nodes = fromSymbol(symbol, originalContent);
  const content = toContent(symbol, nodes);

  expect(content).toEqual(originalContent);
});

test('serializes block with layer text', () => {
  const instance = SketchModel.symbolInstance({
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  const symbol = Blocks[instance.symbolID].symbol;

  symbol.layers
    .filter(Layers.isSymbolInstance)
    .filter((layer) => layer.symbolID === heading5SymbolId)
    .forEach((layer) => {
      instance.overrideValues.push(
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName([layer.do_objectID], 'blockText'),
          value: 'hello',
        }),
      );
    });

  const originalContent = extractBlockContent(instance);
  const nodes = fromSymbol(symbol, originalContent);
  const content = toContent(symbol, nodes);

  expect(content).toEqual(originalContent);
  expect(nodes).toMatchSnapshot();
});
