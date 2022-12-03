import { useMultiplayerContext } from './MultiplayerContext';
import { useSelector } from './useSelector';

export function useMultiplayer() {
  const multiplayer = useMultiplayerContext();

  // Actions
  const join = multiplayer.join;
  const leave = multiplayer.leave;
  const setKeyValue = multiplayer.setKeyValue;

  // State
  const userName = useSelector(multiplayer.userName);
  const userId = useSelector(multiplayer.userId);
  const channels = useSelector(multiplayer.channels);
  const state = useSelector(multiplayer.state);

  return { join, leave, setKeyValue, userName, userId, channels, state };
}
