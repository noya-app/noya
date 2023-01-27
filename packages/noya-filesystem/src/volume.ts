import { Directory, Entries, Node, Volume } from 'imfs';
import { FileSystem } from './fileSystem';
import { FileMap } from './zip';

export function toVolume(zip: FileMap) {
  const volume = Volume.create<Uint8Array>() as Directory<Uint8Array>;

  for (const [filename, bytes] of Object.entries(zip)) {
    if (filename.endsWith('/')) {
      Volume.makeDirectory(volume, filename);
    } else {
      Volume.writeFile(volume, filename, bytes, {
        makeIntermediateDirectories: true,
      });
    }
  }

  return volume;
}

export function fromVolume(volume: Node<Uint8Array>) {
  const zip: FileMap = {};

  FileSystem.visit(Entries.createEntry('/', volume), ([filename, node]) => {
    if (filename === '/') return;

    if (node.type === 'file') {
      zip[filename] = node.data;
    }
  });

  return zip;
}
