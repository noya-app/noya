import { FontFamilyId } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { FontDescriptor } from '../fontDescriptor';
import { FontManager } from '../fontManager';

const robotoDescriptor: FontDescriptor = {
  fontFamilyId: 'roboto' as FontFamilyId,
  fontSlant: 'italic',
  fontWeight: 'bold',
};

const fontManager = new FontManager(GoogleFontProvider);

test('get font family id', () => {
  expect(fontManager.getFontFamilyId('Roboto')).toEqual('roboto');
});

test('get font family name', () => {
  expect(fontManager.getFontFamilyName('roboto' as FontFamilyId)).toEqual(
    'Roboto',
  );
});

test('get font file url', () => {
  expect(fontManager.getFontFileUrl(robotoDescriptor)).toEqual(
    'https://fonts.gstatic.com/s/roboto/v27/KFOjCnqEu92Fr1Mu51TzBhc9AMX6lJBP.ttf',
  );
});
