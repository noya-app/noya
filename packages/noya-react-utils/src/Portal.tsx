import React, {
  memo,
  useRef,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useLayoutEffect,
  PropsWithChildren,
} from 'react';

import { uuid } from 'noya-utils';

interface PortalNode {
  id: string;
  node: ReactNode;
  onChangeOpen: (isOpen: boolean) => void;
}

interface ContextType {
  setNode: (node: PortalNode) => void;
  removeNode: () => void;
}

const PortalContext = createContext<ContextType>({
  setNode: () => {},
  removeNode: () => {},
});

export const PortalProvider = memo(function PortalProvider({
  children,
}: PropsWithChildren<{}>) {
  const [node, setNode] = useState<PortalNode | undefined>();
  // Temp handle to the node while currently displayed node
  // is unmouting
  const waitingNodeRef = useRef<PortalNode | undefined>();
  const nodeRef = useRef(node);

  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const setPortalNode = useCallback((newNode: PortalNode) => {
    if (!nodeRef.current) {
      setNode(newNode);
      return;
    }

    // Same node as mounted -> replace content
    if (nodeRef.current.id === newNode.id) {
      setNode(newNode);
      return;
    }

    // There is currently different node mounted
    // call the node to unmount itself
    nodeRef.current.onChangeOpen(false);
    // Save new node to mount it after
    // current node will finish unmounting
    waitingNodeRef.current = newNode;
  }, []);

  const removePortalNode = useCallback(() => {
    setNode(undefined);

    // Append new waiting node
    if (waitingNodeRef.current) {
      // setTimeout prevents sharing values
      // between same type children components (?!)
      setTimeout(() => {
        setNode(waitingNodeRef.current);
        waitingNodeRef.current = undefined;
      });
    }
  }, []);

  const value = useMemo(
    () => ({ setNode: setPortalNode, removeNode: removePortalNode }),
    [setPortalNode, removePortalNode],
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {node?.node}
    </PortalContext.Provider>
  );
});

export const Portal = memo(function Portal({
  children,
  onChangeOpen,
}: PropsWithChildren<{
  onChangeOpen: (isOpen: boolean) => void;
}>) {
  const { setNode, removeNode } = useContext(PortalContext);
  const nodeId = useMemo(() => uuid(), []);

  useLayoutEffect(() => {
    setNode({ id: nodeId, onChangeOpen, node: children });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, setNode]);

  useEffect(() => {
    return () => {
      removeNode();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});
