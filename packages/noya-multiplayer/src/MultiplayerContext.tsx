import { useLazyValue } from 'noya-react-utils';
import { createContext, memo, ReactNode, useContext } from 'react';
import { Multiplayer, MultiplayerOptions } from './Multiplayer';

const MultiplayerContext = createContext<Multiplayer | undefined>(undefined);

interface Props extends MultiplayerOptions {
  children: ReactNode;
}

export const MultiplayerProvider = memo(function MultiplayerProvider({
  userName,
  children,
}: Props) {
  const multiplayer = useLazyValue(() => {
    const multiplayer = new Multiplayer({ userName });
    multiplayer.connect();
    return multiplayer;
  });

  return (
    <MultiplayerContext.Provider value={multiplayer}>
      {children}
    </MultiplayerContext.Provider>
  );
});

export function useMultiplayer() {
  const value = useContext(MultiplayerContext);

  if (!value) {
    throw new Error('Missing MultiplayerContext');
  }

  return value;
}
