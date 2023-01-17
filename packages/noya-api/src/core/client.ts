import { observable } from '@legendapp/state';
import { memoizedGetter } from 'noya-utils';
import { makeCollectionReducer } from './collection';
import { INoyaNetworkClient, NoyaNetworkClient } from './networkClient';
import { NoyaFile, NoyaFileData, NoyaSession } from './schema';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network';

const fileReducer = makeCollectionReducer<NoyaFile>({
  createItem: (parameters) => ({ ...parameters, userId: 'unused' }),
});

export class NoyaClient {
  networkClient: INoyaNetworkClient;
  files$ = observable<NoyaFile[]>([]);
  session$ = observable<NoyaSession | null>(null);

  constructor({ networkClient }: NoyaClientOptions) {
    this.networkClient = networkClient;

    if (typeof window !== 'undefined') {
      this.#fetchSession();
      this.#fetchFiles();
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
    });
  }

  get assets() {
    return memoizedGetter(this, 'assets', {
      create: this.networkClient.assets.create,
      url: this.networkClient.assets.url,
    });
  }

  #fetchFiles = async () => {
    const files = await this.networkClient.files.list();
    this.files$.set(files);
  };

  #createFile = async (
    data: NoyaFileData,
    { fetchPolicy }: { fetchPolicy?: NoyaFetchPolicy } = {
      fetchPolicy: 'cache-and-network',
    },
  ) => {
    const result = await this.networkClient.files.create(data);

    if (fetchPolicy === 'cache-and-network') {
      this.#fetchFiles();
    }

    return result;
  };

  #updateFile: NoyaNetworkClient['files']['update'] = async (...args) => {
    const [id, data] = args;

    this.files$.set((files) =>
      fileReducer(files, { type: 'update', id, data }),
    );

    const result = await this.networkClient.files.update(...args);
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
