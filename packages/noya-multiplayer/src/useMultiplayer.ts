import { useCallback, useMemo } from 'react';
import { useMultiplayer } from './MultiplayerContext';
import { useObservableSelector } from './useObservable';

export function useMultiplayerStateKey(
  channelId: string,
  key: string,
): [Uint8Array | undefined, (value: Uint8Array) => void] {
  const { state, setKeyValue } = useMultiplayer();

  const value = useObservableSelector(state, () => state[channelId][key].get());

  const setValue = useCallback(
    (value: Uint8Array) => setKeyValue(channelId, key, value),
    [channelId, key, setKeyValue],
  );

  return useMemo(() => [value, setValue], [value, setValue]);
}

export function useMultiplayerStateString(
  channelId: string,
  key: string,
): [string | undefined, (value: string) => void] {
  const [buffer, setBuffer] = useMultiplayerStateKey(channelId, key);

  return useMemo(
    () => [
      buffer ? new TextDecoder().decode(buffer) : undefined,
      (value: string) => setBuffer(new TextEncoder().encode(value)),
    ],
    [buffer, setBuffer],
  );
}

export function useMultiplayerStateJSON<T>(
  channelId: string,
  key: string,
): [T | undefined, (value: T) => void] {
  const [string, setString] = useMultiplayerStateString(channelId, key);

  return useMemo(
    () => [
      string !== undefined ? JSON.parse(string) : undefined,
      (value: T) => setString(JSON.stringify(value)),
    ],
    [string, setString],
  );
}
