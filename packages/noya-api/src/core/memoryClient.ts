import { uuid } from 'noya-utils';
import { fileReducer } from './collection';
import { INoyaNetworkClient } from './networkClient';
import {
  NoyaEmailList,
  NoyaFile,
  noyaFileListSchema,
  NoyaShare,
  NoyaSharedFile,
} from './schema';

export type NoyaMemoryClientData = {
  files: NoyaFile[];
};

type MemoryClientOptions = {
  onChange?: () => void;
};

export class NoyaMemoryClient implements INoyaNetworkClient {
  data: NoyaMemoryClientData;

  constructor(
    data: NoyaMemoryClientData = { files: [] },
    options: MemoryClientOptions = {},
  ) {
    this.data = new Proxy(data, {
      set(target, p, newValue, receiver) {
        const result: boolean = Reflect.set(target, p, newValue, receiver);
        options.onChange?.();
        return result;
      },
    });
  }

  emailLists = {
    list: async () => [],
    update: async (): Promise<NoyaEmailList> => {
      return {
        id: '',
        name: '',
        description: null,
        optIn: false,
        url: '',
      };
    },
  };

  auth = {
    session: async () => {
      return {
        expires: '',
        user: {
          id: 'johndoe',
          name: 'John Doe',
          email: 'johndoe@noyasoftware.com',
          image: null,
        },
      };
    },
  };

  assets = {
    create: async (data: ArrayBuffer, fileId: string) => {
      return '';
    },
    url: () => {
      return '';
    },
  };

  billing: INoyaNetworkClient['billing'] = {
    read: async () => {
      return {
        availableProducts: [],
        subscriptions: [],
        portalUrl: null,
      };
    },
  };

  files: INoyaNetworkClient['files'] = {
    list: async () => this.data.files,
    read: async (id: string) => {
      const file = this.data.files.find((file) => file.id === id);
      if (!file) throw new Error('File not found');
      return file;
    },
    create: async (fields) => {
      if ('shareId' in fields || 'fileId' in fields) {
        throw new Error(
          'Cannot create a file with a shareId or fileId using MemoryClient',
        );
      }

      this.data.files = fileReducer(this.data.files, {
        type: 'create',
        file: {
          id: uuid(),
          data: fields.data,
          version: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return this.data.files[this.data.files.length - 1];
    },
    update: async (id, data) => {
      this.data.files = fileReducer(this.data.files, {
        type: 'update',
        id,
        data,
        version:
          (this.data.files.find((file) => file.id === id)?.version || 0) + 1,
      });
    },
    delete: async (id) => {
      this.data.files = fileReducer(this.data.files, { type: 'delete', id });
    },
    download: {
      url: (id, format, size) => {
        return '';
      },
    },
    shares: {
      list: async () => [],
      readSharedFile: async (id) => 0 as unknown as NoyaSharedFile,
      create: async (data) => 0 as unknown as NoyaShare,
    },
  };

  stringify() {
    return JSON.stringify({
      files: this.data.files.map((file) => ({
        ...file,
        // The API returns this as a string, so we serialize here so our
        // schema parsers match
        data: JSON.stringify(file.data),
      })),
    });
  }

  static parse(json: string): NoyaMemoryClientData | undefined {
    try {
      const parsed = JSON.parse(json);
      const files = noyaFileListSchema.parse(parsed.files);
      return { files };
    } catch (error) {
      return undefined;
    }
  }
}
