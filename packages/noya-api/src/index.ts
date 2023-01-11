import { NoyaClient } from './core/client';
import { NoyaAPIError } from './core/error';
import { NoyaNetworkClient } from './core/networkClient';
import { NoyaFile, NoyaFileList, NoyaSession, NoyaUser } from './core/schema';

export * from './react/context';
export * from './react/hooks';

export namespace NoyaAPI {
  export const NetworkClient = NoyaNetworkClient;
  export const Client = NoyaClient;
  export const Error = NoyaAPIError;

  export type File = NoyaFile;
  export type FileList = NoyaFileList;
  export type User = NoyaUser;
  export type Session = NoyaSession;
}
