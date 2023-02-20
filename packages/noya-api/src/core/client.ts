import { observable } from '@legendapp/state';
import { memoizedGetter } from 'noya-utils';
import { fileReducer } from './collection';
import { INoyaNetworkClient, NoyaNetworkClient } from './networkClient';
import {
  NoyaBilling,
  NoyaEmailList,
  NoyaFile,
  NoyaFileData,
  NoyaSession,
} from './schema';
import { throttleAsync } from './throttleAsync';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network';

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

  constructor({ networkClient }: NoyaClientOptions) {
    this.networkClient = networkClient;

    if (typeof window !== 'undefined') {
      this.#fetchSession();
      this.#fetchFiles();
      this.#fetchBilling();
      // this.#fetchEmailLists();
    }
  }

  reloadFiles() {
    if (this.files$.get().loading) return;

    this.files$.set({ files: [], loading: true });

    this.#fetchFiles();
  }

  #fetchSession = async () => {
    const session = await this.networkClient.auth.session();
    this.session$.set(session);
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

  get billing() {
    return memoizedGetter(this, 'billing', {
      read: this.#fetchBilling,
    });
  }

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

    if (fetchPolicy === 'cache-and-network') {
      this.#fetchFiles();
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

    return this.#updateFile(id, { ...file.data, document });
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
