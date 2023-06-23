import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { Blocks } from '../ayon/blocks/blocks';
import { heading4SymbolId, heroSymbolV2Id } from '../ayon/blocks/symbolIds';
import {
  SerializedBlockContent,
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

function filterEmptyOverrides(blockContent: SerializedBlockContent) {
  return {
    ...blockContent,
    overrides: blockContent.overrides.filter((o) => o.value !== ''),
  };
}

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

  expect(filterEmptyOverrides(content)).toEqual(originalContent);
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

  const targetLayer = symbol.layers
    .filter(Layers.isSymbolInstance)
    .find((layer) => layer.symbolID === heading4SymbolId);

  instance.overrideValues.push(
    SketchModel.overrideValue({
      overrideName: Overrides.encodeName(
        [targetLayer!.do_objectID],
        'blockText',
      ),
      value: 'hello',
    }),
  );

  const originalContent = extractBlockContent(instance);
  const nodes = fromSymbol(symbol, originalContent);
  const content = toContent(symbol, nodes);

  expect(filterEmptyOverrides(content)).toEqual(originalContent);
  expect(nodes).toMatchSnapshot();
});
