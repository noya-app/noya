import React, {
  memo,
  useState,
  ReactNode,
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useContext,
  useLayoutEffect,
  useRef,
  useEffect,
} from 'react';

import { uuid } from 'noya-utils';

interface NodeMap {
  [id: string]: ReactNode;
}

interface ContextType {
  setNode: (id: string, node: ReactNode) => void;
  removeNode: (id: string) => void;
}

// Based on https://gist.github.com/renaudtertrais/d541e9d5d4e5614216c1a44cf4ae2dc2
function omit<T extends Object>(obj: Object, inKeys: Array<keyof T> | keyof T) {
  const keys = inKeys instanceof Array ? inKeys : [inKeys];

  return Object.entries(obj)
    .filter(([key]) => !keys.includes(key as keyof T))
    .reduce(
      (acc, [key, value]) =>
        Object.assign({}, acc, {
          [key]: value,
        }),
      {},
    );
}

const PortalContext = createContext<ContextType>({
  setNode: () => {},
  removeNode: () => {},
});

export const PortalProvider = memo(function PortalProvider({
  children,
}: PropsWithChildren<{}>) {
  const [nodes, setNodes] = useState<NodeMap>({});

  const setNode = useCallback(
    (id: string, node: ReactNode) => {
      setNodes((prevNodes) => ({
        ...prevNodes,
        [id]: node,
      }));
    },
    [setNodes],
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((prevNodes) => omit(prevNodes, id));
    },
    [setNodes],
  );

  const value = useMemo(
    () => ({
      setNode,
      removeNode,
    }),
    [setNode, removeNode],
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {Object.entries(nodes).map(([id, node]) => (
        <React.Fragment key={id}>{node}</React.Fragment>
      ))}
    </PortalContext.Provider>
  );
});

export const Portal = memo(function Portal({
  children,
}: PropsWithChildren<{}>) {
  const { setNode, removeNode } = useContext(PortalContext);
  const nodeId = useRef(uuid()).current;

  useLayoutEffect(() => {
    setNode(nodeId, children);
  }, [nodeId, children, setNode]);

  useEffect(() => {
    return () => {
      removeNode(nodeId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});
