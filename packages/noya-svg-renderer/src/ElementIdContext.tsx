import React, {
  memo,
  useRef,
  ReactNode,
  useContext,
  createContext,
} from 'react';

type ElementIdContextValue = (prefix: string) => string;

const ElementIdContext = createContext<ElementIdContextValue | undefined>(
  undefined,
);

interface Props {
  prefix: string;
  children: ReactNode;
}

export const ElementIdProvider = memo(function ElementIdProvider({
  prefix,
  children,
}: Props) {
  const id = useRef(1);
  const contextValue = useRef((instancePrefix: string) => {
    return prefix + instancePrefix + id.current++;
  }).current;

  return (
    <ElementIdContext.Provider value={contextValue}>
      {children}
    </ElementIdContext.Provider>
  );
});

export function useGetNextElementId() {
  const value = useContext(ElementIdContext);

  if (!value) {
    throw new Error('Missing ElementIdContextValue');
  }

  return value;
}
