import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { Blocks } from '../ayon/blocks/blocks';
import {
  heading4SymbolId,
  heroSymbolV2Id,
  heroWithImageSymbolId,
} from '../ayon/blocks/symbolIds';
import {
  EditorBlockContent,
  extractBlockContent,
  fromContent,
  toContent,
} from '../ayon/editor/serialization';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

function filterEmptyOverrides(blockContent: EditorBlockContent) {
  return {
    ...blockContent,
    overrides: blockContent.overrides.filter((o) => o.value !== ''),
  };
}

test('serializes block', () => {
  const instance = SketchModel.symbolInstance({
    do_objectID: 'b',
    blockText: '',
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  const symbol = Blocks[instance.symbolID].symbol;

  const originalContent = extractBlockContent(instance);
  const nodes = fromContent(symbol, originalContent);
  const content = toContent(symbol, nodes);

  expect(filterEmptyOverrides(content)).toEqual(originalContent);
});

test('serializes block with layer text', () => {
  const instance = SketchModel.symbolInstance({
    do_objectID: 'a',
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

  expect(originalContent).toMatchSnapshot('originalContent');

  const nodes = fromContent(symbol, originalContent);

  expect(nodes).toMatchSnapshot('nodes');

  const content = toContent(symbol, nodes);

  expect(content).toMatchSnapshot('content');

  expect(filterEmptyOverrides(content)).toEqual(originalContent);
  expect(nodes).toMatchSnapshot();
});

test('serializes nested block', () => {
  const instance = SketchModel.symbolInstance({
    do_objectID: 'a',
    symbolID: heroWithImageSymbolId,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  const symbol = Blocks[instance.symbolID].symbol;

  const heroLayer = symbol.layers
    .filter(Layers.isSymbolInstance)
    .find((layer) => layer.symbolID === heroSymbolV2Id);

  const nestedSymbol = Blocks[heroLayer!.symbolID].symbol;

  const targetLayer = nestedSymbol.layers
    .filter(Layers.isSymbolInstance)
    .find((layer) => layer.symbolID === heading4SymbolId);

  instance.overrideValues.push(
    SketchModel.overrideValue({
      overrideName: Overrides.encodeName(
        [heroLayer!.do_objectID, targetLayer!.do_objectID],
        'blockText',
      ),
      value: 'hello',
    }),
  );

  const originalContent = extractBlockContent(instance);

  expect(originalContent).toEqual({
    blockText: '',
    overrides: [
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName(
          [heroLayer!.do_objectID, targetLayer!.do_objectID],
          'blockText',
        ),
        value: 'hello',
      }),
    ],
    symbolId: symbol.symbolID,
    layerPath: [],
  });

  const nodes = fromContent(symbol, originalContent);
  const content = toContent(symbol, nodes);
  expect(filterEmptyOverrides(content)).toEqual(originalContent);
});
