type NoyaAPIErrorType = 'unauthorized' | 'unknown';

export class NoyaAPIError extends Error {
  constructor(public type: NoyaAPIErrorType, message: string) {
    super(message);
  }
}
