import { useLazyValue } from 'noya-react-utils';
import React, { createContext, memo, ReactNode, useContext } from 'react';
import { Pipeline } from './Pipeline';

const PipelineContext = createContext<Pipeline | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const PipelineProvider = memo(function PipelineProvider({
  children,
}: Props) {
  const contextValue = useLazyValue(() => new Pipeline());

  return (
    <PipelineContext.Provider value={contextValue}>
      {children}
    </PipelineContext.Provider>
  );
});

export function usePipeline() {
  const value = useContext(PipelineContext);

  if (!value) {
    throw new Error('Missing PipelineContext');
  }

  return value;
}
