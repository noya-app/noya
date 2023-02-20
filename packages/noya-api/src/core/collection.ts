import produce from 'immer';
import { NoyaFile, NoyaFileData } from './schema';

type FilesAction =
  | {
      type: 'create';
      file: NoyaFile;
    }
  | {
      type: 'delete';
      id: string;
    }
  | {
      type: 'update';
      id: string;
      data: NoyaFileData;
      version: number;
    }
  | {
      type: 'merge';
      files: NoyaFile[];
    };

export const fileReducer = (collection: NoyaFile[], action: FilesAction) => {
  switch (action.type) {
    case 'merge': {
      const { files } = action;

      return produce(collection, (draft) => {
        files.forEach((item) => {
          const index = draft.findIndex((i) => i.id === item.id);

          if (index === -1) {
            draft.push(item);
          } else {
            if (item.version >= draft[index].version) {
              draft[index] = item;
            }
          }
        });
      });
    }
    case 'create': {
      return produce(collection, (draft) => {
        draft.push(action.file);
      });
    }
    case 'delete': {
      return collection.filter((item) => item.id !== action.id);
    }
    case 'update': {
      return collection.map((item) => {
        if (item.id === action.id) {
          return produce(item, (draft) => {
            draft.data = action.data;
            draft.updatedAt = new Date().toISOString();
            draft.version = action.version;
          });
        }

        return item;
      });
    }
  }
};
