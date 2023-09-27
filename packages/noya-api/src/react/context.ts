import { NoyaAPI } from 'noya-api';
import { createContext, useContext, useMemo } from 'react';
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

/**
 * If there's no client, fallback to a memory client.
 * We do this to safely render content when logged out (e.g. when sharing).
 */
export function useNoyaClientOrFallback() {
  const value = useContext(NoyaAPIContext);

  const memoryClient = useMemo(() => {
    return new NoyaAPI.Client({
      networkClient: new NoyaAPI.MemoryClient(),
    });
  }, []);

  return value ?? memoryClient;
}
