import { observable } from '@legendapp/state';
import { memoizedGetter } from 'noya-utils';
import { makeCollectionReducer } from './collection';
import { INoyaNetworkClient, NoyaNetworkClient } from './networkClient';
import { NoyaBilling, NoyaFile, NoyaFileData, NoyaSession } from './schema';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network';

const fileReducer = makeCollectionReducer<NoyaFile>({
  createItem: (parameters) => ({ ...parameters, userId: 'unused', version: 0 }),
});

export class NoyaClient {
  networkClient: INoyaNetworkClient;
  files$ = observable<NoyaFile[]>([]);
  session$ = observable<NoyaSession | null>(null);
  billing$ = observable<NoyaBilling & { loading: boolean }>({
    availableProducts: [],
    portalUrl: null,
    subscriptions: [],
    loading: true,
  });

  constructor({ networkClient }: NoyaClientOptions) {
    this.networkClient = networkClient;

    if (typeof window !== 'undefined') {
      this.#fetchSession();
      this.#fetchFiles();
      this.#fetchBilling();
    }
  }

  #fetchSession = async () => {
    const session = await this.networkClient.auth.session();
    this.session$.set(session);
  };

  get files() {
    return memoizedGetter(this, 'files', {
      read: this.networkClient.files.read,
      create: this.#createFile,
      update: this.#updateFile,
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
    this.files$.set(files);
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

  #updateFile = async (id: string, data: NoyaFileData) => {
    // There might be a race condition here if we try to update a file before
    // it exists on the backend, but that shouldn't happen yet. In that case
    // we'll send the update without a version and it will always win.
    const version = this.files$.get().find((file) => file.id === id)?.version;

    this.files$.set((files) =>
      fileReducer(files, { type: 'update', id, data }),
    );

    const result = await this.networkClient.files.update(
      id,
      data,
      version !== undefined ? version + 1 : undefined,
    );

    this.#fetchFiles();

    return result;
  };

  #deleteFile: NoyaNetworkClient['files']['delete'] = async (...args) => {
    this.files$.set((files) =>
      fileReducer(files, { type: 'delete', id: args[0] }),
    );

    const result = await this.networkClient.files.delete(...args);
    this.#fetchFiles();
    return result;
  };
}
