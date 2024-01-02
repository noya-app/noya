import type { Sketch } from '@noya-app/noya-file-format';
import JSZip from 'jszip';

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

export async function decode(encoded: ArrayBuffer): Promise<SketchFile> {
  const zip = await JSZip.loadAsync(encoded);

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

export async function encode(decoded: SketchFile): Promise<ArrayBuffer> {
  const { document, meta, user, pages, images } = decoded;

  const zip = new JSZip();

  // We set the `document.pages` array before encoding. The app may not
  // maintain this array properly, since once the pages are in-memory, we don't
  // need to access it anymore. So we generate a new valid array here.
  const normalizedDocument: Sketch.Document = {
    ...document,
    pages: pages.map((page) => ({
      _class: 'MSJSONFileReference',
      _ref_class: 'MSImmutablePage',
      _ref: `pages/${page.do_objectID}`,
    })),
  };

  zip.file('document.json', JSON.stringify(normalizedDocument));
  zip.file('meta.json', JSON.stringify(meta));
  zip.file('user.json', JSON.stringify(user));

  pages.forEach((page) => {
    zip.file(`pages/${page.do_objectID}.json`, JSON.stringify(page));
  });

  Object.entries(images).forEach(([name, data]) => {
    zip.file(name, data);
  });

  return zip.generateAsync({
    type: 'arraybuffer',
    mimeType: 'application/zip',
  });
}
