import JSZip from 'jszip';
import type Sketch from '@sketch-hq/sketch-file-format-ts';

async function readEntry<T>(zip: JSZip, name: string): Promise<T> {
  const data = await zip.file(name)!.async('string');

  return JSON.parse(data);
}

export type FileMap = Record<string, ArrayBuffer>;

async function readFiles(zip: JSZip, directory: string = ''): Promise<FileMap> {
  const files = await Promise.all(
    Object.entries(zip.files)
      .filter(([name]) => name.startsWith(directory))
      .map(([name, file]) =>
        file
          .async('arraybuffer')
          .then((data): [string, ArrayBuffer] => [name, data]),
      ),
  );

  return Object.fromEntries(files);
}

export type SketchFile = {
  document: Sketch.Document;
  meta: Sketch.Meta;
  user: Sketch.User;
  pages: Sketch.Page[];
  images: FileMap;
};

export async function parse(source: ArrayBuffer): Promise<SketchFile> {
  const zip = await JSZip.loadAsync(source);

  const [document, meta, user, images] = await Promise.all([
    readEntry<Sketch.Document>(zip, 'document.json'),
    readEntry<Sketch.Meta>(zip, 'meta.json'),
    readEntry<Sketch.User>(zip, 'user.json'),
    readFiles(zip, 'images/'),
  ]);

  const pages = await Promise.all(
    document.pages.map((page) =>
      readEntry<Sketch.Page>(zip, `${page._ref}.json`),
    ),
  );

  return {
    document,
    meta,
    user,
    pages,
    images,
  };
}
