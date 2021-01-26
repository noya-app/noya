import jszip from 'jszip';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';

async function readEntry<T>(zip: jszip, name: string): Promise<T> {
  const data = await zip.file(name)!.async('string');

  return JSON.parse(data);
}

export type SketchFile = {
  document: FileFormat.Document;
  meta: FileFormat.Meta;
  user: FileFormat.User;
  pages: FileFormat.Page[];
};

export async function parse(source: ArrayBuffer): Promise<SketchFile> {
  const zip = await jszip.loadAsync(source);

  const [document, meta, user] = await Promise.all([
    readEntry<FileFormat.Document>(zip, 'document.json'),
    readEntry<FileFormat.Meta>(zip, 'meta.json'),
    readEntry<FileFormat.User>(zip, 'user.json'),
  ]);

  const pages = await Promise.all(
    document.pages.map((page) =>
      readEntry<FileFormat.Page>(zip, `${page._ref}.json`),
    ),
  );

  return {
    document,
    meta,
    user,
    pages,
  };
}
