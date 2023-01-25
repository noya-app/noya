import { NoyaAPI } from 'noya-api';

const host = process.env.NEXT_PUBLIC_NOYA_WEB_URL;

const networkClient = host
  ? new NoyaAPI.NetworkClient({
      baseURI: `${host}/api`,
      onError: (error) => {
        if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
          window.location.href = host;
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

if (host) {
  console.info('INFO: Using Noya API at', host);
} else {
  console.info('INFO: Using local storage');
}

export const noyaClient = new NoyaAPI.Client({
  networkClient,
});
