import { getTraitsDisplayName } from 'noya-fonts';

test('displays trait names', () => {
  expect(
    getTraitsDisplayName({
      fontSlant: 'upright',
      fontWeight: 'bold',
    }),
  ).toEqual('Bold');

  expect(
    getTraitsDisplayName({
      fontSlant: 'italic',
      fontWeight: 'bold',
    }),
  ).toEqual('Bold Italic');

  expect(
    getTraitsDisplayName({
      fontSlant: 'upright',
      fontWeight: 'regular',
    }),
  ).toEqual('Regular');

  expect(
    getTraitsDisplayName({
      fontSlant: 'italic',
      fontWeight: 'regular',
    }),
  ).toEqual('Italic');
});
