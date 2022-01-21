import React, { useContext, createContext, PropsWithChildren } from 'react';

import type { CanvasKit } from 'canvaskit';
import { SuspendedValue } from 'noya-react-utils';

// We don't start loading CanvasKit until the Provider renders the first time,
// since we currently support setting the wasm path at runtime when the app starts,
// which needs to happen before `loadCanvasKit` is called.
let suspendedCanvasKit: SuspendedValue<CanvasKit>;

// Export Context object to be used in noya-renderer useCanvasKit
export const CanvasKitContext = createContext<CanvasKit | undefined>(undefined);

interface CanvasKitProviderProps {
  loadCanvasKit?: () => Promise<CanvasKit>;
  canvasKit?: CanvasKit;
}

const Provider: React.FC<PropsWithChildren<CanvasKitProviderProps>> = (
  props,
) => {
  const { children } = props;

  if (!suspendedCanvasKit && props.loadCanvasKit) {
    suspendedCanvasKit = new SuspendedValue<CanvasKit>(props.loadCanvasKit());
  }

  const canvasKit = props.canvasKit ?? suspendedCanvasKit.getValueOrThrow();

  return (
    <CanvasKitContext.Provider value={canvasKit}>
      {children}
    </CanvasKitContext.Provider>
  );
};

export const CanvasKitProvsider = React.memo(Provider);

export function useCanvasKit() {
  const value = useContext(CanvasKitContext);

  if (!value) {
    throw new Error('Missing CanvasKitProvider');
  }

  return value;
}
