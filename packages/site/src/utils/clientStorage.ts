import { Emitter } from 'noya-fonts';
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
  dsShowMetadata: 'noya-ds-show-metadata',
  noyaPrefersColorScheme: 'noya-prefers-color-scheme',
};

export const ayonOnboardingStep = [
  'started',
  'insertedBlock',
  'configuredBlockType',
  'configuredBlockText',
  'dismissedSupportInfo',
] as const;

export type AyonOnboardingStep = (typeof ayonOnboardingStep)[number];

export type ClientStorageKey = keyof typeof ClientStorageDefinitions;

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

    this.emitter.emit(storageKey, value);
  },

  emitter: new Emitter<[ClientStorageKey, string | null]>(),

  _isListening: false,

  addListener(
    storageKey: ClientStorageKey,
    listener: (newValue: string | null) => void,
  ): () => void {
    // Set up a single listener for all storage events
    if (!this._isListening && typeof window !== 'undefined') {
      this._isListening = true;

      window.addEventListener('storage', (event: StorageEvent) => {
        this.emitter.emit(event.key as any, event.newValue);
      });
    }

    return this.emitter.addListener((key, value) => {
      if (key === storageKey) {
        listener(value);
      }
    });
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

  // Listen for changes to localStorage from other tabs
  useEffect(() => {
    const dispose = ClientStorage.addListener(storageKey, (newValue) => {
      setState(newValue as T | null);
    });

    return () => dispose();
  }, [storageKey]);

  return useMemo(() => [state, setValue] as const, [setValue, state]);
}
