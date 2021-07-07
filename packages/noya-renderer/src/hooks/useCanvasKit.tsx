import type { CanvasKit } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { SuspendedValue } from 'noya-utils';
import { createContext, memo, useContext, ReactNode } from 'react';
// import loadSVGKit from 'noya-svgkit';

// let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadSVGKit());
let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadCanvasKit());

const CanvasKitContext = createContext<CanvasKit | undefined>(undefined);

export const CanvasKitProvider = memo(function CanvasKitProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const CanvasKit = suspendedCanvasKit.getValueOrThrow();

  return (
    <CanvasKitContext.Provider value={CanvasKit}>
      {children}
    </CanvasKitContext.Provider>
  );
});

export function useCanvasKit() {
  const value = useContext(CanvasKitContext);

  if (!value) {
    throw new Error('Missing CanvasKitProvider');
  }

  return value;
}
