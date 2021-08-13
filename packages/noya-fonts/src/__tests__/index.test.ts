import { decodeFontName, encodeFontName, formatFontFamilyID } from 'noya-fonts';

test('decode font name', () => {
  expect(decodeFontName('Roboto-Bold')).toEqual({
    fontFamily: 'Roboto',
    fontVariant: 'Bold',
  });
});

test('encode font name', () => {
  expect(encodeFontName('Roboto', 'Bold')).toEqual('Roboto-Bold');
});

test('it creates font family ids', () => {
  expect(formatFontFamilyID('Roboto')).toEqual('roboto');
});
