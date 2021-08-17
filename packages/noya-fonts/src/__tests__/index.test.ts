import { decodeFontName, encodeFontName, formatFontFamilyId } from 'noya-fonts';
import { FontTraits } from '../fontDescriptor';

const boldUprightTraits: FontTraits = {
  fontSlant: 'upright',
  fontWeight: 'bold',
};

const lightItalicTraits: FontTraits = {
  fontSlant: 'italic',
  fontWeight: 'light',
};

test('decode font name', () => {
  expect(decodeFontName('Roboto-Bold')).toEqual({
    fontFamily: 'Roboto',
    fontTraits: boldUprightTraits,
  });

  expect(decodeFontName('Roboto-LightItalic')).toEqual({
    fontFamily: 'Roboto',
    fontTraits: lightItalicTraits,
  });
});

test('encode font name', () => {
  expect(encodeFontName('Roboto', boldUprightTraits)).toEqual('Roboto-Bold');

  expect(encodeFontName('Roboto', lightItalicTraits)).toEqual(
    'Roboto-LightItalic',
  );
});

test('it creates font family ids', () => {
  expect(formatFontFamilyId('Roboto')).toEqual('roboto');
});
