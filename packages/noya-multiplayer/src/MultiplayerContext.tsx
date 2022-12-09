import { NoyaSession } from 'noya-backend-client';
import { useLazyValue } from 'noya-react-utils';
import React, { createContext, memo, ReactNode, useContext } from 'react';

type MultiplayerContextValue = {
  session: NoyaSession;
};

const MultiplayerContext = createContext<MultiplayerContextValue | undefined>(
  undefined,
);

interface Props {
  children: ReactNode;
}

export const MultiplayerProvider = memo(function MultiplayerProvider({
  children,
}: Props) {
  const contextValue = useLazyValue(() => {
    return { session: new NoyaSession('Sam', 'http://149.28.218.149/') };
  });

  return (
    <MultiplayerContext.Provider value={contextValue}>
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
