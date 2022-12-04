import { useEffect } from 'react';
import { useMultiplayer } from './MultiplayerContext';
import { useObservableSelector } from './useObservable';

export function useAutoJoinChannel(channelId: string) {
  const { channels, join } = useMultiplayer();

  const isMember = useObservableSelector(channels, () =>
    channels.includes(channelId),
  );

  useEffect(() => {
    if (isMember) return;

    join(channelId);
  }, [channelId, isMember, join]);

  return isMember;
}
