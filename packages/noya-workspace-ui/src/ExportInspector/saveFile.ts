import { fileSave } from 'browser-fs-access';
import { FileType, getFileExtensionForType } from 'noya-utils';

export async function saveFile(
  name: string,
  type: FileType,
  data: ArrayBuffer,
) {
  const file = new File([data], name, {
    type,
  });

  await fileSave(
    file,
    { fileName: file.name, extensions: [`.${getFileExtensionForType(type)}`] },
    undefined,
    false,
  );
}
