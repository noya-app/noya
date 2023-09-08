type NoyaAPIErrorType =
  | 'unauthorized'
  | 'notFound'
  | 'unknown'
  | 'internalServerError'
  | 'timeout';

export class NoyaAPIError extends Error {
  constructor(public type: NoyaAPIErrorType, message: string) {
    super(message);
  }
}
