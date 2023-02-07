import { INoyaNetworkClient, NoyaAPI, NoyaAPIError } from 'noya-api';

export const host = process.env.NEXT_PUBLIC_NOYA_WEB_URL;

if (host) {
  console.info('INFO: Using Noya API at', host);
} else {
  console.info('INFO: Using local storage');
}

function handleError(error: NoyaAPIError) {
  if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
    if (host) {
      window.location.href = host;
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
}

export function createNetworkClient({
  onError = handleError,
}: { onError?: (error: NoyaAPIError) => boolean } = {}): INoyaNetworkClient {
  const networkClient = host
    ? new NoyaAPI.NetworkClient({ baseURI: `${host}/api`, onError })
    : new NoyaAPI.LocalStorageClient();

  return networkClient;
}

export function createNoyaClient() {
  return new NoyaAPI.Client({
    networkClient: createNetworkClient(),
  });
}
