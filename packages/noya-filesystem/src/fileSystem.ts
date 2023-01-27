import { Entries, Entry } from 'imfs';
import { withOptions } from 'tree-visit';

export const FileSystem = withOptions<Entry<Uint8Array>>({
  getChildren: Entries.getEntries,
});
