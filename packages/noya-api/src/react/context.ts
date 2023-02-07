import { createContext, useContext } from 'react';
import { NoyaClient } from '../core/client';

type NoyaAPIContextValue = NoyaClient;

const NoyaAPIContext = createContext<NoyaAPIContextValue | undefined>(
  undefined,
);

export const NoyaAPIProvider = NoyaAPIContext.Provider;

export function useNoyaClient() {
  const value = useContext(NoyaAPIContext);

  if (!value) {
    throw new Error('Missing NoyaAPIContextValue');
  }

  return value;
}

export function useOptionalNoyaClient() {
  return useContext(NoyaAPIContext);
}
