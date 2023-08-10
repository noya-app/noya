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
  const result = useSelector(
    useNoyaClient().generatedComponentNames$.names[key],
  ) as NoyaGeneratedName[] | undefined;
  const loading = useSelector(
    useNoyaClient().generatedComponentNames$.loadingNames[key],
  );
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

export function useGeneratedLayouts() {
  const { generatedLayouts$, loadingLayouts$ } = useNoyaClient();
  const layouts = useSelector(generatedLayouts$);
  const loading = useSelector(loadingLayouts$);
  return useMemo(() => ({ layouts, loading }), [loading, layouts]);
}

export function useGeneratedLayout(name: string, description: string) {
  const { componentLayoutCacheKey, generatedLayouts$, loadingLayouts$ } =
    useNoyaClient();
  const key = componentLayoutCacheKey(name, description);
  const layout = useSelector(
    () => generatedLayouts$[key].get() as string | undefined,
  );
  const loading = useSelector(() => loadingLayouts$[key].get() ?? false);
  return useMemo(() => ({ layout, loading }), [loading, layout]);
}
