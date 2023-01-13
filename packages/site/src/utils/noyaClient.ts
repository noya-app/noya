import { NoyaAPI } from 'noya-api';

const host = 'https://www.noya.io';
// const host = 'http://localhost:31112';

const networkClient = new NoyaAPI.NetworkClient({
  baseURI: `${host}/api`,
  onError: (error) => {
    if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
      window.location.href = host;
      return true;
    } else {
      return false;
    }
  },
});

// const networkClient = new NoyaAPI.LocalStorageClient();

export const noyaClient = new NoyaAPI.Client({
  networkClient,
});
