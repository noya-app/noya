import { observable } from '@legendapp/state';
import produce from 'immer';
import { Rect } from 'noya-geometry';
import { memoizedGetter, range } from 'noya-utils';
import { fileReducer } from './collection';
import { INoyaNetworkClient, NoyaNetworkClient } from './networkClient';
import {
  NoyaBilling,
  NoyaEmailList,
  NoyaFile,
  NoyaFileData,
  NoyaGeneratedName,
  NoyaJson,
  NoyaMetadataItem,
  NoyaRandomImageResponse,
  NoyaSession,
  NoyaUserData,
} from './schema';
import { throttleAsync } from './throttleAsync';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network' | 'network-only';

const GENERATED_LAYOUT_COUNT = 8;

export class NoyaClient {
  networkClient: INoyaNetworkClient;
  files$ = observable<{
    files: NoyaFile[];
    loading: boolean;
  }>({
    files: [],
    loading: true,
  });
  session$ = observable<NoyaSession | null>(null);
  billing$ = observable<NoyaBilling & { loading: boolean }>({
    availableProducts: [],
    portalUrl: null,
    subscriptions: [],
    loading: true,
  });
  emailLists$ = observable<{
    emailLists: NoyaEmailList[];
    loading: boolean;
  }>({
    emailLists: [],
    loading: true,
  });
  userData$ = observable<{
    userData: NoyaUserData | undefined;
    loading: boolean;
  }>({
    userData: undefined,
    loading: true,
  });
  generatedNames$ = observable<Record<string, NoyaGeneratedName[]>>({});
  loadingNames$ = observable<Record<string, boolean>>({});
  generatedDescriptions$ = observable<Record<string, string>>({});
  loadingDescriptions$ = observable<Record<string, boolean>>({});
  generatedDescriptionIndex: Record<string, number> = {};
  generatedLayouts$ = observable<Record<string, string[]>>({});
  loadingLayouts$ = observable<Record<string, boolean[]>>({});
  generatedLayoutIndex: Record<string, number> = {};
  randomImages$ = observable<Record<string, NoyaRandomImageResponse>>({});
  loadingRandomImages$ = observable<Record<string, boolean>>({});

  constructor({ networkClient }: NoyaClientOptions) {
    this.networkClient = networkClient;

    if (typeof window !== 'undefined') {
      this.#fetchSession();
      this.#fetchFiles();
      this.#fetchBilling();
      this.#fetchUserData();
      // this.#fetchEmailLists();
    }
  }

  reloadFiles() {
    if (this.files$.get().loading) return;

    this.files$.set({ files: [], loading: true });

    this.#fetchFiles();
  }

  get random() {
    return memoizedGetter(this, 'random', {
      image: this.#fetchRandomImage,
      resetImage: this.#resetRandomImage,
    });
  }

  randomImageCacheKey = (options: { id?: string; query: string }) => {
    const { id, query } = options;
    const normalized = query.trim().toLowerCase();
    return id ? `${id}:${normalized}` : normalized;
  };

  #fetchRandomImage = async (
    options: { id?: string } & Parameters<
      INoyaNetworkClient['random']['image']
    >[0],
  ) => {
    const key = this.randomImageCacheKey(options);

    if (this.loadingRandomImages$[key].get()) return;

    const existing = this.randomImages$[key].get();

    if (existing) return existing;

    this.loadingRandomImages$.set((prev) => ({ ...prev, [key]: true }));

    const data = await this.networkClient.random.image(options);

    this.randomImages$.set((prev) => ({ ...prev, [key]: data }));
    this.loadingRandomImages$.set((prev) => ({ ...prev, [key]: false }));
  };

  #resetRandomImage = (options: { id?: string; query: string }) => {
    const key = this.randomImageCacheKey(options);

    this.randomImages$[key].delete();
    this.loadingRandomImages$[key].delete();
  };

  get generate() {
    return memoizedGetter(this, 'generate', {
      componentNames: this.#generateComponentNames,
      componentDescription: this.#generateComponentDescription,
      componentLayouts: this.#generateComponentLayouts,
      resetComponentDescription: this.#resetGenerateComponentDescription,
      resetComponentLayouts: this.#resetGenerateComponentLayouts,
    });
  }

  #generateComponentNames = async (options: {
    name: string;
    rect?: Rect;
  }): Promise<NoyaGeneratedName[]> => {
    const name = options.name.trim();
    const key = name.toLowerCase();

    const existing = this.generatedNames$[key].get();

    if (Array.isArray(existing) && existing.length > 0) return existing;

    this.loadingNames$.set((prev) => ({ ...prev, [key]: true }));

    const result = await this.networkClient.generate.componentNames({
      ...options,
      name,
    });

    this.generatedNames$.set((prev) => ({ ...prev, [key]: result }));
    this.loadingNames$.set((prev) => ({ ...prev, [key]: false }));

    return result;
  };

  componentDescriptionCacheKey = (name: string) => name.trim().toLowerCase();

  #generateComponentDescription = async (options: { name: string }) => {
    const name = options.name.trim();
    const key = this.componentDescriptionCacheKey(options.name);

    const existing = this.generatedDescriptions$[key].get();

    if (typeof existing === 'string') return existing;

    // If loading, return nothing (TODO: await fetched value)
    if (this.loadingDescriptions$[key].get()) return undefined;

    this.loadingDescriptions$.set((prev) => ({ ...prev, [key]: true }));
    this.generatedDescriptionIndex[key] =
      this.generatedDescriptionIndex[key] ?? 0;

    const iterator =
      await this.networkClient.generate.componentDescriptionFromName(
        name,
        this.generatedDescriptionIndex[key],
      );

    let text = '';
    for await (const chunk of iterator) {
      text += chunk;
      let nextText = text;
      this.generatedDescriptions$.set((prev) => ({ ...prev, [key]: nextText }));
    }

    this.loadingDescriptions$.set((prev) => ({ ...prev, [key]: false }));

    return iterator;
  };

  componentLayoutCacheKey = (name: string, description: string) =>
    `${name.trim().toLowerCase()}:${description.trim().toLowerCase()}`;

  #generateComponentLayouts = async (options: {
    name: string;
    description: string;
  }) => {
    const name = options.name.trim();
    const description = options.description.trim();
    const key = this.componentLayoutCacheKey(name, description);

    const existing = this.generatedLayouts$[key].get();

    if (Array.isArray(existing)) return existing;

    const rangeArray = range(0, GENERATED_LAYOUT_COUNT);

    this.generatedLayouts$.set((prev) => ({
      ...prev,
      [key]: rangeArray.map((_) => ''),
    }));
    this.loadingLayouts$.set((prev) => ({
      ...prev,
      [key]: rangeArray.map((_) => true),
    }));
    this.generatedLayoutIndex[key] = this.generatedLayoutIndex[key] ?? 0;
    const baseIndex = this.generatedLayoutIndex[key];

    const promises = rangeArray.map(async (index) => {
      const iterable =
        await this.networkClient.generate.componentLayoutsFromDescription(
          name,
          description,
          baseIndex + index,
        );

      let text = '';
      for await (const chunk of iterable) {
        text += chunk;
        let nextText = text;

        this.generatedLayouts$.set((prev) => ({
          ...prev,
          [key]: updateIndex(prev[key], index, nextText),
        }));
      }

      this.loadingLayouts$.set((prev) => ({
        ...prev,
        [key]: updateIndex(prev[key], index, false),
      }));
    });

    await Promise.all(promises);

    return;
  };

  #resetGenerateComponentDescription = (name: string) => {
    const key = name.trim().toLowerCase();

    this.generatedDescriptions$[key].delete();
    this.loadingDescriptions$[key].delete();
    const index = this.generatedDescriptionIndex[key];
    this.generatedDescriptionIndex[key] = index !== undefined ? index + 1 : 0;
  };

  #resetGenerateComponentLayouts = (name: string, description: string) => {
    const key = this.componentLayoutCacheKey(name, description);

    this.generatedLayouts$[key].delete();
    this.loadingLayouts$[key].delete();
    const index = this.generatedLayoutIndex[key];
    this.generatedLayoutIndex[key] =
      index !== undefined ? index + GENERATED_LAYOUT_COUNT : 0;
  };

  #fetchSession = async () => {
    const session = await this.networkClient.auth.session();
    this.session$.set(session);
  };

  #fetchUserData = async () => {
    const userData = await this.networkClient.userData.read();
    this.userData$.set({ userData, loading: false });
  };

  get emailLists() {
    return memoizedGetter(this, 'emailLists', {
      update: this.#updateEmailList,
    });
  }

  #fetchEmailLists = async () => {
    const emailLists = await this.networkClient.emailLists.list();
    this.emailLists$.set({ emailLists, loading: false });
  };

  #updateEmailList = async (id: string, data: { optIn: boolean }) => {
    await this.networkClient.emailLists.update(id, data);
    this.#fetchEmailLists();
  };

  get files() {
    return memoizedGetter(this, 'files', {
      read: this.networkClient.files.read,
      create: this.#createFile,
      update: this.#updateFile,
      updateFileName: this.#updateFileName,
      updateFileDocument: this.#updateFileDocument,
      delete: this.#deleteFile,
      refetch: this.#fetchFiles,
      download: {
        url: this.networkClient.files.download.url,
      },
      shares: {
        readFile: this.networkClient.files.shares.readSharedFile,
        create: this.networkClient.files.shares.create,
        list: this.networkClient.files.shares.list,
      },
    });
  }

  get assets() {
    return memoizedGetter(this, 'assets', {
      create: this.networkClient.assets.create,
      url: this.networkClient.assets.url,
    });
  }

  get metadata() {
    return memoizedGetter(this, 'metadata', {
      set: this.#setMetadata,
    });
  }

  get billing() {
    return memoizedGetter(this, 'billing', {
      read: this.#fetchBilling,
    });
  }

  #setMetadata = async (key: string, value: NoyaJson) => {
    this.userData$.userData.set((userData) => {
      if (!userData) return userData;

      return produce(userData, (draft) => {
        if (!draft) return;

        const index = draft.metadata.findIndex((item) => item.key === key);

        if (index === -1) {
          const metadataItem: NoyaMetadataItem = {
            key,
            value,
            url: `/api/user/metadata/${key}`,
          };
          draft.metadata.push(metadataItem);
        } else {
          draft.metadata[index].value = value;
        }
      });
    });

    await this.networkClient.metadata.set(key, value);
  };

  #fetchBilling = async () => {
    const billing = await this.networkClient.billing.read();
    this.billing$.set({ ...billing, loading: false });
  };

  #fetchFiles = async () => {
    const files = await this.networkClient.files.list();

    this.files$.set(({ files: currentFiles }) => ({
      files: fileReducer(currentFiles, { type: 'merge', files }),
      loading: false,
    }));
  };

  #createFile = async (
    fields: { data: NoyaFileData } | { shareId: string } | { fileId: string },
    { fetchPolicy }: { fetchPolicy?: NoyaFetchPolicy } = {
      fetchPolicy: 'cache-and-network',
    },
  ) => {
    const result = await this.networkClient.files.create(fields);

    if (fetchPolicy !== 'no-cache') {
      this.files$.files.set((files) =>
        fileReducer(files, { type: 'merge', files: [result] }),
      );
    }

    return result;
  };

  #getLocalFile = (id: string) => {
    const file = this.files$.get().files.find((file) => file.id === id);

    if (!file) throw new Error(`File not found: ${id}`);

    return file;
  };

  #updateFileName = async (id: string, name: string) => {
    const file = this.#getLocalFile(id);

    return this.#updateFile(id, { ...file.data, name });
  };

  #updateFileDocument = async (
    id: string,
    document: NoyaFileData['document'],
  ) => {
    const file = this.#getLocalFile(id);

    return this.#updateFile(id, { ...file.data, document } as NoyaFileData);
  };

  throttledUpdateFileMap = new Map<
    string,
    INoyaNetworkClient['files']['update']
  >();

  // Ensure there's only one active request to update a file at a time.
  getThrottledUpdateFile(id: string) {
    let throttledUpdateFile = this.throttledUpdateFileMap.get(id);

    if (!throttledUpdateFile) {
      throttledUpdateFile = throttleAsync(
        (...args: Parameters<INoyaNetworkClient['files']['update']>) =>
          this.networkClient.files.update(...args),
      );

      this.throttledUpdateFileMap.set(id, throttledUpdateFile);
    }

    return throttledUpdateFile;
  }

  #updateFile = async (id: string, data: NoyaFileData) => {
    const file = this.#getLocalFile(id);

    const version = file.version + 1;

    this.files$.files.set((files) =>
      fileReducer(files, { type: 'update', id, data, version }),
    );

    const result = await this.getThrottledUpdateFile(id)(id, data, version);

    this.#fetchFiles();

    return result;
  };

  #deleteFile: NoyaNetworkClient['files']['delete'] = async (...args) => {
    this.files$.files.set((files) =>
      fileReducer(files, { type: 'delete', id: args[0] }),
    );

    const result = await this.networkClient.files.delete(...args);
    this.#fetchFiles();
    return result;
  };
}

function updateIndex<T>(array: T[], index: number, value: T) {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}
