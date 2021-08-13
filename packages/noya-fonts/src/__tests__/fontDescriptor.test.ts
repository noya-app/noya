import { FontFamilyID } from 'noya-fonts';
import {
  descriptorToFontId,
  FontDescriptor,
  fontIdToDescriptor,
} from '../fontDescriptor';

test('encode and decodes descriptor', () => {
  const descriptor: FontDescriptor = {
    fontFamilyId: 'roboto' as FontFamilyID,
    fontSlant: 'italic',
    fontWeight: 'bold',
  };

  const id = descriptorToFontId(descriptor);
  const result = fontIdToDescriptor(id);

  expect(descriptor).toEqual(result);
});
