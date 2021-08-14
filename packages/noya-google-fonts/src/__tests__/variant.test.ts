import {
  decodeGoogleFontVariant,
  encodeGoogleFontVariant,
  getGoogleFontVariantWeight,
} from '../variant';

test('it should get font variant weight', () => {
  expect(getGoogleFontVariantWeight('100')).toEqual('ultralight');
  expect(getGoogleFontVariantWeight('100italic')).toEqual('ultralight');
  expect(getGoogleFontVariantWeight('regular')).toEqual('regular');
  expect(getGoogleFontVariantWeight('italic')).toEqual('regular');
});

test('it should decode font variant', () => {
  expect(decodeGoogleFontVariant('100italic')).toEqual({
    fontWeight: 'ultralight',
    fontSlant: 'italic',
  });
});

test('it should encode font variant', () => {
  expect(encodeGoogleFontVariant('italic', 'ultralight')).toEqual('100italic');
});
