import { useSelector } from '@legendapp/state/react';
import { NoyaAPI } from 'noya-api';
import { useMemo } from 'react';
import { NoyaRequestHandle } from '../core/networkClient';
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
  const { generatedNames$, loadingNames$ } = useNoyaClient();
  const result = useSelector(
    () => generatedNames$[key].get() as NoyaGeneratedName[] | undefined,
  );
  const loading = useSelector(() => loadingNames$[key].get());
  return useMemo(() => ({ names: result ?? [], loading }), [loading, result]);
}

export function useGeneratedComponentDescriptions() {
  const { generatedDescriptions$, loadingDescriptions$ } = useNoyaClient();
  const descriptions = useSelector(generatedDescriptions$);
  const loading = useSelector(loadingDescriptions$);
  return useMemo(() => ({ descriptions, loading }), [loading, descriptions]);
}

export function useGeneratedComponentDescription(name: string) {
  const key = name.trim().toLowerCase();
  const { generatedDescriptions$, loadingDescriptions$ } = useNoyaClient();
  const description = useSelector(
    () => generatedDescriptions$[key].get() as string | undefined,
  );
  const loading = useSelector(() => loadingDescriptions$[key].get());
  return useMemo(() => ({ description, loading }), [loading, description]);
}

export function useRandomImages() {
  const { randomImages$, loadingRandomImages$ } = useNoyaClient();
  const images = useSelector(randomImages$);
  const loading = useSelector(loadingRandomImages$);
  return useMemo(() => ({ images, loading }), [loading, images]);
}

export function useNetworkRequests() {
  const { requests$ } = useNoyaClient();
  const requests = useSelector(requests$) as NoyaRequestHandle[];
  return requests;
}
