import { Entries, Entry } from 'imfs';
import { defineTree } from 'tree-visit';

export const FileSystem = defineTree<Entry<Uint8Array>>({
  getChildren: Entries.getEntries,
});
