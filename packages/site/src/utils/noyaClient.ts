import { NoyaAPI } from 'noya-api';

export const NOYA_HOST = process.env.NEXT_PUBLIC_NOYA_WEB_URL;

if (NOYA_HOST) {
  console.info('INFO: Using Noya API at', NOYA_HOST);
} else {
  console.info('INFO: Using local storage');
}

/**
 * This client throws errors if the user isn't logged in
 */
export const networkClientThatThrows = NOYA_HOST
  ? new NoyaAPI.NetworkClient({
      baseURI: `${NOYA_HOST}/api`,
    })
  : undefined;

export const networkClientThatRedirects = NOYA_HOST
  ? new NoyaAPI.NetworkClient({
      baseURI: `${NOYA_HOST}/api`,
      onError: (error) => {
        if (error instanceof NoyaAPI.Error) {
          switch (error.type) {
            case 'unauthorized':
              if (NOYA_HOST) {
                window.location.href = NOYA_HOST;
              }
              return true;
            case 'internalServerError':
            case 'timeout':
              window.noyaPageWillReload = true;
              window.location.reload();
              return true;
            case 'notFound': // Catch 404s internally
            case 'unknown':
              return false;
          }
        }
        return false;
      },
    })
  : undefined;

export const localStorageClient = new NoyaAPI.LocalStorageClient();

declare global {
  interface Window {
    noyaPageWillReload?: boolean;
  }
}
