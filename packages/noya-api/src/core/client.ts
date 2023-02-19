import { observable } from '@legendapp/state';
import { memoizedGetter } from 'noya-utils';
import { makeCollectionReducer } from './collection';
import { INoyaNetworkClient, NoyaNetworkClient } from './networkClient';
import {
  NoyaBilling,
  NoyaEmailList,
  NoyaFile,
  NoyaFileData,
  NoyaSession,
} from './schema';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network';

const fileReducer = makeCollectionReducer<NoyaFile>({
  createItem: (parameters) => ({ ...parameters, userId: 'unused', version: 0 }),
});

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
      hasPendingUpdate: this.#hasPendingUpdate,
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
    this.files$.set({
      files,
      loading: false,
    });
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

  #getVersion = (id: string) => {
    return this.files$.get().files.find((file) => file.id === id)?.version ?? 0;
  };

  inflightUpdate = new Map<string, Pick<NoyaFile, 'id' | 'version'>>();
  pendingUpdate = new Map<string, Pick<NoyaFile, 'id' | 'version' | 'data'>>();

  #hasPendingUpdate = (id: string) => {
    return this.pendingUpdate.has(id);
  };

  #updateFile = async (
    id: string,
    data: NoyaFileData,
    newVersion = this.#getVersion(id) + 1,
  ): Promise<NoyaFile | undefined> => {
    this.files$.files.set((files) =>
      fileReducer(files, { type: 'update', id, data, version: newVersion }),
    );

    if (this.inflightUpdate.has(id)) {
      this.pendingUpdate.set(id, { id, version: newVersion, data });
      return;
    }

    this.inflightUpdate.set(id, { id, version: newVersion });

    const result = await this.networkClient.files.update(id, data, newVersion);

    this.inflightUpdate.delete(id);

    if (this.pendingUpdate.has(id)) {
      const pending = this.pendingUpdate.get(id)!;
      this.pendingUpdate.delete(id);

      if (pending.version > result.version) {
        return this.#updateFile(id, data, result.version + 1);
      }
    }

    // TODO: Put this back?
    // this.#fetchFiles();

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
