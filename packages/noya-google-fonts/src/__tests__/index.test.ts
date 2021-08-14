import { GoogleFontProvider } from '../index';

const {
  getFontFamilyIdList,
  getFontFamilyId,
  getFontDescriptorsForFamily,
  getFontFileUrl,
} = GoogleFontProvider;

const robotoFamilyID = getFontFamilyId('roboto')!;

test('it should get font id', () => {
  expect(getFontFamilyId('Noto Sans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('NotoSans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('Noto-Sans')?.toString()).toEqual('notosans');
  expect(getFontFamilyId('Noto_Sans')?.toString()).toEqual('notosans');
});

test('it should get all font family ids', () => {
  expect(getFontFamilyIdList().length).toEqual(1075);
});

test('it should get font variants', () => {
  expect(getFontDescriptorsForFamily(robotoFamilyID)).toMatchSnapshot();
});

test('it should get font file', () => {
  expect(
    getFontFileUrl({
      fontFamilyId: robotoFamilyID,
      fontSlant: 'upright',
      fontWeight: 'bold',
    }),
  ).toEqual(
    'http://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
  );
});
