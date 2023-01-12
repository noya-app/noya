import { NoyaMemoryClient } from './memoryClient';

const STORAGE_KEY = 'noya-dev-storage';

type IStorage = Pick<typeof localStorage, 'getItem' | 'setItem'>;

const DEFAULT_STORAGE: IStorage =
  typeof localStorage !== 'undefined'
    ? localStorage
    : { getItem: () => null, setItem: () => {} };

export class NoyaLocalStorageClient extends NoyaMemoryClient {
  constructor({ storage = DEFAULT_STORAGE }: { storage?: IStorage } = {}) {
    const stored = storage.getItem(STORAGE_KEY);

    super(stored ? NoyaMemoryClient.parse(stored) : undefined, {
      onChange: () => storage.setItem(STORAGE_KEY, this.stringify()),
    });
  }
}
