import { useSelector } from '@legendapp/state/react';
import { NoyaAPI } from 'noya-api';
import { range } from 'noya-utils';
import { useMemo } from 'react';
import { GENERATED_PAGE_NAME_COUNT, GeneratedPageName } from '../core/client';
import { NoyaRequestSnapshot } from '../core/networkClient';
import { NoyaGeneratedName } from '../core/schema';
import {
  useNoyaClient,
  useNoyaClientOrFallback,
  useOptionalNoyaClient,
} from './context';

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
  const { generatedNames$, loadingNames$ } = useNoyaClientOrFallback();
  const result = useSelector(
    () => generatedNames$[key].get() as NoyaGeneratedName[] | undefined,
  );
  const loading = useSelector(() => loadingNames$[key].get());
  return useMemo(() => ({ names: result ?? [], loading }), [loading, result]);
}

export function useGeneratedComponentDescriptions() {
  const { generatedDescriptions$, loadingDescriptions$ } =
    useNoyaClientOrFallback();
  const descriptions = useSelector(generatedDescriptions$);
  const loading = useSelector(loadingDescriptions$);
  return useMemo(() => ({ descriptions, loading }), [loading, descriptions]);
}

export function useGeneratedComponentDescription(name: string) {
  const key = name.trim().toLowerCase();
  const { generatedDescriptions$, loadingDescriptions$ } =
    useNoyaClientOrFallback();
  const description = useSelector(
    () => generatedDescriptions$[key].get() as string | undefined,
  );
  const loading = useSelector(() => loadingDescriptions$[key].get());
  return useMemo(() => ({ description, loading }), [loading, description]);
}

export function useRandomImages() {
  const { randomImages$, loadingRandomImages$ } = useNoyaClientOrFallback();
  const images = useSelector(randomImages$);
  const loading = useSelector(loadingRandomImages$);
  return useMemo(() => ({ images, loading }), [loading, images]);
}

export function useRandomIcons() {
  const { randomIcons$, loadingRandomIcons$ } = useNoyaClientOrFallback();
  const icons = useSelector(randomIcons$);
  const loading = useSelector(loadingRandomIcons$);
  return useMemo(() => ({ icons, loading }), [loading, icons]);
}

export function useNetworkRequests() {
  const { requests$ } = useNoyaClientOrFallback();
  const requests = useSelector(requests$) as NoyaRequestSnapshot[];
  return requests;
}

export type EnhancedGeneratedPageName = GeneratedPageName & {
  index: number;
  type: 'suggestion';
};

export function useGeneratedPageNames(): EnhancedGeneratedPageName[] {
  const { generatedPageNames$ } = useNoyaClientOrFallback();
  const names = useSelector(generatedPageNames$) as GeneratedPageName[];

  const namesWithDefaultsAndTypes = useMemo(() => {
    const rangeArray = range(0, GENERATED_PAGE_NAME_COUNT);

    // Fill any empty slots with default names in the 'loading' state
    const withDefaults = rangeArray.map((index): GeneratedPageName => {
      const name = names[index];
      return name ?? { name: `Page ${index + 1}`, loading: true, prompt: '' };
    });

    return withDefaults.map(
      (name, index): EnhancedGeneratedPageName => ({
        ...name,
        index,
        type: 'suggestion',
      }),
    );
  }, [names]);

  // Take the first 3
  return namesWithDefaultsAndTypes.slice(0, 3);
}
