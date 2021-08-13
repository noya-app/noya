import { decodeFontName, encodeFontName } from 'noya-fonts';

test('decode font name', () => {
  expect(decodeFontName('Roboto-Bold')).toEqual({
    fontFamily: 'Roboto',
    fontVariant: 'Bold',
  });
});

test('encode font name', () => {
  expect(encodeFontName('Roboto', 'Bold')).toEqual('Roboto-Bold');
});
