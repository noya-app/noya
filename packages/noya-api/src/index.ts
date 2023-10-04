import { NoyaClient, NoyaImageGenerator } from './core/client';
import { NoyaAPIError } from './core/error';
import { NoyaLocalStorageClient } from './core/localStorageClient';
import { NoyaMemoryClient } from './core/memoryClient';
import { NoyaNetworkClient } from './core/networkClient';
import {
  DS,
  DSConfig,
  DSSource,
  NoyaExportFormat,
  NoyaFile,
  NoyaFileData,
  NoyaFileList,
  NoyaGeneratedName,
  NoyaJson,
  NoyaPrice,
  NoyaProduct,
  NoyaRandomIconResponse,
  NoyaRandomImageResponse,
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

  export type Json = NoyaJson;
  export type File = NoyaFile;
  export type FileData = NoyaFileData;
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
  export type GeneratedName = NoyaGeneratedName;
  export type RandomImageResponse = NoyaRandomImageResponse;
  export type RandomIconResponse = NoyaRandomIconResponse;
  export type ImageGenerator = NoyaImageGenerator;
}

export type { DS, DSConfig, DSSource };
