import { useSelector } from '@legendapp/state/react';
import { NoyaAPI } from 'noya-api';
import { useMemo } from 'react';
import { NoyaGeneratedName } from '../core/schema';
import { useNoyaClient, useOptionalNoyaClient } from './context';

export function useNoyaFiles() {
  const files = useSelector(useNoyaClient().files$);
  return files;
}

export function useNoyaSession() {
  const session = useSelector(useNoyaClient().session$);
  return session;
}

export function useOptionalNoyaSession() {
  const session = useSelector(useOptionalNoyaClient()?.session$);
  return session;
}

export function useNoyaBilling() {
  const billing = useSelector(useNoyaClient().billing$);
  return billing;
}

export function useNoyaEmailLists() {
  const emailLists = useSelector(useNoyaClient().emailLists$);
  return emailLists;
}

export function useNoyaUserData() {
  const userData = useSelector(useNoyaClient().userData$);
  return userData;
}

export function useMetadata<T extends NoyaAPI.Json>(key: string) {
  const { userData } = useNoyaUserData();
  const metadata = userData?.metadata || [];
  const metadataItem = metadata.find((item) => item.key === key);
  return metadataItem?.value as T | undefined;
}

export function useGeneratedComponentNames(name: string) {
  const key = name.trim().toLowerCase();
  const names = useSelector(
    useNoyaClient().generatedComponentNames$.names[key],
  ) as NoyaGeneratedName[] | undefined;
  const loading = useSelector(
    useNoyaClient().generatedComponentNames$.loadingNames[key],
  );
  return useMemo(() => ({ names: names ?? [], loading }), [loading, names]);
}
