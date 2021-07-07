import type { CanvasKit } from 'canvaskit';
import { loadCanvasKit } from '..';
import { SuspendedValue } from 'noya-utils';
import { createContext, memo, useContext, ReactNode } from 'react';
// import loadSVGKit from 'noya-svgkit';

// let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadSVGKit());
let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadCanvasKit());

const CanvasKitContext = createContext<CanvasKit | undefined>(undefined);

type CanvasKitBackend = 'canvaskit' | 'svg';

export const CanvasKitProvider = memo(function CanvasKitProvider({
  children,
  backend = 'canvaskit',
}: {
  children?: ReactNode;
  backend?: CanvasKitBackend;
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
