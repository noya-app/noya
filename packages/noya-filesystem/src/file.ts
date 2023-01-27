import { FileMap, unzip, zip } from './zip';

export async function toZipFile(data: FileMap, name: string) {
  const bytes = await zip(data);

  return new File([bytes], name, { type: 'application/zip' });
}

export async function fromZipFile(file: File): Promise<FileMap> {
  const arrayBuffer = await file.arrayBuffer();

  return unzip(new Uint8Array(arrayBuffer));
}
