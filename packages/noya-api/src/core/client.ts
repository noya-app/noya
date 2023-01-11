import { observable } from '@legendapp/state';
import produce from 'immer';
import { NoyaNetworkClient } from './networkClient';
import { NoyaFile, NoyaFileData, NoyaSession } from './schema';

type NoyaClientOptions = { networkClient: NoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network';

export class NoyaClient {
  networkClient: NoyaNetworkClient;
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
    return {
      read: this.networkClient.files.read,
      create: this.#createFile,
      update: this.#updateFile,
      delete: this.#deleteFile,
      refetch: this.#fetchFiles,
    };
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
      files.map((file) =>
        file.id === id
          ? produce(file, (draft) => {
              draft.data = data;
              draft.updatedAt = new Date().toISOString();
            })
          : file,
      ),
    );

    const result = await this.networkClient.files.update(...args);
    this.#fetchFiles();
    return result;
  };

  #deleteFile: NoyaNetworkClient['files']['delete'] = async (...args) => {
    this.files$.set((files) => files.filter((file) => file.id !== args[0]));

    const result = await this.networkClient.files.delete(...args);
    this.#fetchFiles();
    return result;
  };
}
