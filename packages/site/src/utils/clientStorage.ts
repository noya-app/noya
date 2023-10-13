import { useCallback, useEffect, useMemo, useState } from 'react';

const ClientStorageDefinitions = {
  preferredViewType: 'noya-ayon-preferred-view-type',
  ayonOnboardingStep: 'noya-ayon-onboarding-step',
  welcomeCardDismissed: 'noya-ayon-welcome-card-dismissed',
  ayonLayerInspectorView: 'noya-ayon-layer-inspector-view',
  networkDebuggerFilter: 'noya-ayon-network-debugger-filter',
  networkDebuggerPendingFilter: 'noya-ayon-network-debugger-pending-filter',
  networkDebuggerStreamingFilter: 'noya-ayon-network-debugger-streaming-filter',
  ayonShowPageSuggestions: 'noya-ayon-show-page-suggestions',
  ayonShowComponentSuggestions: 'noya-ayon-show-component-suggestions',
};

export const ayonOnboardingStep = [
  'started',
  'insertedBlock',
  'configuredBlockType',
  'configuredBlockText',
  'dismissedSupportInfo',
] as const;

export type AyonOnboardingStep = (typeof ayonOnboardingStep)[number];

type ClientStorageKey = keyof typeof ClientStorageDefinitions;

export const ClientStorage = {
  getItem(storageKey: ClientStorageKey): string | null {
    const key = ClientStorageDefinitions[storageKey];

    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  },

  setItem(storageKey: ClientStorageKey, value: string | null): void {
    const key = ClientStorageDefinitions[storageKey];

    if (typeof localStorage === 'undefined') {
      return;
    }

    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  },
};

export function usePersistentState<T extends string = string>(
  storageKey: ClientStorageKey,
): readonly [T | null, (newValue: T) => void];
export function usePersistentState<T extends string = string>(
  storageKey: ClientStorageKey,
  defaultValue: T,
): readonly [T, (newValue: T) => void];
export function usePersistentState<T extends string = string>(
  storageKey: ClientStorageKey,
  defaultValue?: T,
) {
  const [state, setState] = useState<T | null>(null);

  useEffect(() => {
    const value = ClientStorage.getItem(storageKey) as T | null;

    setState(value ?? defaultValue ?? null);
  }, [defaultValue, storageKey]);

  const setValue = useCallback(
    (newValue: T) => {
      ClientStorage.setItem(storageKey, newValue);
      setState(newValue);
    },
    [storageKey],
  );

  return useMemo(() => [state, setValue] as const, [setValue, state]);
}
