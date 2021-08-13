import { decodeFontName, encodeFontName, formatFontFamilyID } from 'noya-fonts';

test('decode font name', () => {
  expect(decodeFontName('Roboto-Bold')).toEqual({
    fontFamily: 'Roboto',
    traits: {
      fontSlant: 'upright',
      fontWeight: 'bold',
    },
  });
});

test('encode font name', () => {
  expect(
    encodeFontName('Roboto', {
      fontSlant: 'upright',
      fontWeight: 'bold',
    }),
  ).toEqual('Roboto-Bold');
});

test('it creates font family ids', () => {
  expect(formatFontFamilyID('Roboto')).toEqual('roboto');
});
