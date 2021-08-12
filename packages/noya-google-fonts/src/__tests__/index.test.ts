import {
  decodeFontVariant,
  getFontFamilyList,
  getFontFile,
  getFontId,
  getFontVariantCollection,
  getFontVariants,
  getFontVariantWeight,
} from '../index';

test('it should get all font families', () => {
  expect(getFontFamilyList().length).toEqual(1075);
});

test('it should get font variants', () => {
  expect(getFontVariants('Roboto')).toEqual([
    '100',
    '100italic',
    '300',
    '300italic',
    'regular',
    'italic',
    '500',
    '500italic',
    '700',
    '700italic',
    '900',
    '900italic',
  ]);
});

test('it should get a font variant collection', () => {
  expect(getFontVariantCollection('Roboto')).toEqual({
    regular: ['100', '300', 'regular', '500', '700', '900'],
    italic: [
      '100italic',
      '300italic',
      'italic',
      '500italic',
      '700italic',
      '900italic',
    ],
  });
});

test('it should get font variant weight', () => {
  expect(getFontVariantWeight('100')).toEqual('ultralight');
  expect(getFontVariantWeight('100italic')).toEqual('ultralight');
  expect(getFontVariantWeight('regular')).toEqual('regular');
  expect(getFontVariantWeight('italic')).toEqual('regular');
});

test('it should decode font variant', () => {
  expect(decodeFontVariant('100italic')).toEqual({
    weight: 'ultralight',
    variantName: 'italic',
  });
});

test('it should get font file', () => {
  expect(getFontFile('Roboto', '500')).toEqual(
    'http://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf',
  );
});

test('it should get font id', () => {
  expect(getFontId('Noto Sans')).toEqual('notosans');
  expect(getFontId('NotoSans')).toEqual('notosans');
  expect(getFontId('Noto-Sans')).toEqual('notosans');
  expect(getFontId('Noto_Sans')).toEqual('notosans');
});
