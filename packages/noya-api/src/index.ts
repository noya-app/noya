import { NoyaClient } from './core/client';
import { NoyaAPIError } from './core/error';
import { NoyaLocalStorageClient } from './core/localStorageClient';
import { NoyaMemoryClient } from './core/memoryClient';
import { NoyaNetworkClient } from './core/networkClient';
import {
  NoyaExportFormat,
  NoyaFile,
  NoyaFileList,
  NoyaPrice,
  NoyaProduct,
  NoyaSession,
  NoyaSubscription,
  NoyaSubscriptionItem,
  NoyaUser,
} from './core/schema';

export * from './react/context';
export * from './react/hooks';

export namespace NoyaAPI {
  export const NetworkClient = NoyaNetworkClient;
  export const MemoryClient = NoyaMemoryClient;
  export const LocalStorageClient = NoyaLocalStorageClient;
  export const Client = NoyaClient;
  export const Error = NoyaAPIError;

  export type File = NoyaFile;
  export type FileList = NoyaFileList;
  export type User = NoyaUser;
  export type Session = NoyaSession;
  export type ExportFormat = NoyaExportFormat;
  export type Subscription = NoyaSubscription;
  export type Product = NoyaProduct;
  export type Price = NoyaPrice;
  export type SubscriptionItem = NoyaSubscriptionItem;
}
