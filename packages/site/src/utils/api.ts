import { NoyaAPI } from 'noya-api';

export const noyaAPI = new NoyaAPI.Client({
  baseURI: 'http://localhost:31112/api',
  onError: (error) => {
    if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
      window.location.href = 'http://localhost:31112/';
      return true;
    } else {
      return false;
    }
  },
});
