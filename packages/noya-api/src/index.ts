import { NoyaAPIClient } from './client';
import { NoyaAPIError } from './error';
import { NoyaFile, NoyaFileList, NoyaSession, NoyaUser } from './schema';

export namespace NoyaAPI {
  export const Client = NoyaAPIClient;
  export const Error = NoyaAPIError;

  export type File = NoyaFile;
  export type FileList = NoyaFileList;
  export type User = NoyaUser;
  export type Session = NoyaSession;
}
