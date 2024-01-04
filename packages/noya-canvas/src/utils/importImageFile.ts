import { SupportedCanvasUploadType } from '@noya-app/noya-designsystem';
import { Size } from '@noya-app/noya-geometry';
import { getFileExtensionForType } from '@noya-app/noya-utils';
import { TypedFile } from '@noya-app/react-utils';
import type { CanvasKit } from '@noya-app/noya-canvaskit';
import { InsertedImage } from 'noya-state';

export async function importImageFile(
  file: TypedFile<SupportedCanvasUploadType>,
  calculateSize: (bytes: ArrayBuffer) => Size | null,
): Promise<InsertedImage | void> {
  if (file.type === 'image/svg+xml') {
    const svgString = await file.text();

    return {
      name: file.name.replace(/\.svg$/, ''),
      extension: 'svg',
      svgString,
    };
  } else {
    const data = await file.arrayBuffer();
    const size = calculateSize(data);

    if (!size) return;

    if (file.type === '') return;

    const extension = getFileExtensionForType(file.type);

    return {
      name: file.name.replace(new RegExp(`\\.${extension}$`), ''),
      extension,
      size,
      data,
    };
  }
}

export async function importImageFileWithCanvasKit(
  CanvasKit: CanvasKit,
  file: TypedFile<SupportedCanvasUploadType>,
): Promise<InsertedImage | void> {
  return importImageFile(file, (bytes) => {
    const image = CanvasKit.MakeImageFromEncoded(bytes);

    if (!image) return null;

    return { image, width: image.width(), height: image.height() };
  });
}
