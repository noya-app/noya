import { NoyaAPI } from 'noya-api';

// const networkClient = new NoyaAPI.NetworkClient({
//   baseURI: 'http://localhost:31112/api',
//   onError: (error) => {
//     if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
//       window.location.href = 'http://localhost:31112/';
//       return true;
//     } else {
//       return false;
//     }
//   },
// });

const networkClient = new NoyaAPI.LocalStorageClient();

export const noyaClient = new NoyaAPI.Client({
  networkClient,
});
