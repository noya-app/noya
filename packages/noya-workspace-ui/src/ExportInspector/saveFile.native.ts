import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Base64 } from 'noya-utils';

export async function saveFile(
  fileName: string,
  fileType: string,
  data: ArrayBuffer,
) {
  const base64File = Base64.encode(data);
  const fileUrl = `${FileSystem.cacheDirectory}${fileName}`;

  try {
    await FileSystem.writeAsStringAsync(fileUrl, base64File, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUrl);
  } catch (e) {
    console.warn(e);
  }
}
