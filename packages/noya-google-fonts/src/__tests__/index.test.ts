import {
  decodeFontVariant,
  getFontFamilyList,
  getFontFile,
  getFontFamilyId,
  getFontVariantCollection,
  getFontVariants,
  getFontVariantWeight,
} from '../index';

const robotoFamilyID = getFontFamilyId('roboto')!;

test('it should get font id', () => {
  expect(getFontFamilyId('Noto Sans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('NotoSans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('Noto-Sans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('Noto_Sans')?.toString()).toEqual('notosans');
});

test('it should get all font families', () => {
  expect(getFontFamilyList().length).toEqual(1075);
});

test('it should get font variants', () => {
  expect(getFontVariants(robotoFamilyID)).toEqual([
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
  expect(getFontVariantCollection(robotoFamilyID)).toEqual({
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
  expect(getFontFile(robotoFamilyID, '500')).toEqual(
    'http://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf',
  );
});
