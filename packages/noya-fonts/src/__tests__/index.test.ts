import { decodeFontName, encodeFontName, formatFontFamilyId } from 'noya-fonts';
import { FontTraits } from '../fontDescriptor';

const fontTraits: FontTraits = {
  fontSlant: 'upright',
  fontWeight: 'bold',
};

test('decode font name', () => {
  expect(decodeFontName('Roboto-Bold')).toEqual({
    fontFamily: 'Roboto',
    fontTraits,
  });
});

test('encode font name', () => {
  expect(encodeFontName('Roboto', fontTraits)).toEqual('Roboto-Bold');
});

test('it creates font family ids', () => {
  expect(formatFontFamilyId('Roboto')).toEqual('roboto');
});
