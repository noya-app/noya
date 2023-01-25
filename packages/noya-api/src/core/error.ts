type NoyaAPIErrorType = 'unauthorized' | 'unknown' | 'internalServerError';

export class NoyaAPIError extends Error {
  constructor(public type: NoyaAPIErrorType, message: string) {
    super(message);
  }
}
