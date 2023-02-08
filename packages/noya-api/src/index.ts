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
  NoyaShare,
  NoyaSharedFile,
  NoyaSubscription,
  NoyaSubscriptionItem,
  NoyaUser,
} from './core/schema';

export * from './react/context';
export * from './react/hooks';

export namespace NoyaAPI {
  export const NetworkClient = NoyaNetworkClient;
  export type NetworkClient = NoyaNetworkClient;

  export const Client = NoyaClient;
  export type Client = NoyaClient;

  export const Error = NoyaAPIError;
  export type Error = NoyaAPIError;

  export const MemoryClient = NoyaMemoryClient;
  export type MemoryClient = NoyaMemoryClient;

  export const LocalStorageClient = NoyaLocalStorageClient;
  export type LocalStorageClient = NoyaLocalStorageClient;

  export type File = NoyaFile;
  export type FileList = NoyaFileList;
  export type User = NoyaUser;
  export type Session = NoyaSession;
  export type ExportFormat = NoyaExportFormat;
  export type Subscription = NoyaSubscription;
  export type Product = NoyaProduct;
  export type Price = NoyaPrice;
  export type SubscriptionItem = NoyaSubscriptionItem;
  export type Share = NoyaShare;
  export type SharedFile = NoyaSharedFile;
}
