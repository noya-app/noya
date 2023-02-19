import produce from 'immer';
import { uuid } from 'noya-utils';

type CollectionAction<Data> =
  | {
      type: 'create';
      data: Data;
    }
  | {
      type: 'delete';
      id: string;
    }
  | {
      type: 'update';
      id: string;
      data: Data;
      version: number;
    };

type BaseItem<Data> = {
  id: string;
  data: Data;
  updatedAt: string;
  createdAt: string;
  version: number;
};

export const makeCollectionReducer = <Item extends BaseItem<unknown>>({
  createItem,
}: {
  createItem: (parameters: BaseItem<Item['data']>) => Item;
}) => {
  return (collection: Item[], action: CollectionAction<Item['data']>) => {
    switch (action.type) {
      case 'create': {
        const date = new Date().toISOString();

        const newItem = createItem({
          id: uuid(),
          data: action.data,
          updatedAt: date,
          createdAt: date,
          version: 0,
        });

        return produce<Item[], Item[]>(collection, (draft) => {
          draft.push(newItem);
        });
      }
      case 'delete': {
        return collection.filter((item) => item.id !== action.id);
      }
      case 'update': {
        return collection.map((item) => {
          if (item.id === action.id) {
            return produce<Item, Item>(item, (draft) => {
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
};
