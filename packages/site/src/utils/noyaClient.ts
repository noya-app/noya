import { NoyaAPI } from 'noya-api';

export const NOYA_HOST = process.env.NEXT_PUBLIC_NOYA_WEB_URL;

if (NOYA_HOST) {
  console.info('INFO: Using Noya API at', NOYA_HOST);
} else {
  console.info('INFO: Using local storage');
}

export function createNoyaClient() {
  const networkClient = NOYA_HOST
    ? new NoyaAPI.NetworkClient({
        baseURI: `${NOYA_HOST}/api`,
        onError: (error) => {
          if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
            if (NOYA_HOST) {
              window.location.href = NOYA_HOST;
            }
            return true;
          } else if (
            error instanceof NoyaAPI.Error &&
            error.type === 'internalServerError'
          ) {
            window.location.reload();
            return true;
          } else {
            return false;
          }
        },
      })
    : new NoyaAPI.LocalStorageClient();

  return new NoyaAPI.Client({ networkClient });
}
