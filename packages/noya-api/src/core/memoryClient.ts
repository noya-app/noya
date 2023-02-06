import { makeCollectionReducer } from './collection';
import { INoyaNetworkClient } from './networkClient';
import { NoyaFile, noyaFileListSchema } from './schema';

const fileReducer = makeCollectionReducer<NoyaFile>({
  createItem: (parameters) => ({
    ...parameters,
    userId: 'johndoe',
    version: 0,
  }),
});

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

  billing = 0 as any;

  files: INoyaNetworkClient['files'] = {
    list: async () => this.data.files,
    read: async (id: string) => {
      const file = this.data.files.find((file) => file.id === id);
      if (!file) throw new Error('File not found');
      return file;
    },
    create: async (data) => {
      this.data.files = fileReducer(this.data.files, { type: 'create', data });
      return this.data.files[this.data.files.length - 1].id;
    },
    update: async (id, data) => {
      this.data.files = fileReducer(this.data.files, {
        type: 'update',
        id,
        data,
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
