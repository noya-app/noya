import { SuspendedValue } from '@noya-app/react-utils';
import type { CanvasKit } from '@noya-app/noya-canvaskit';
import React, { createContext, memo, ReactNode, useContext } from 'react';
import { loadCanvasKit } from '../loadCanvasKit';

// We don't start loading CanvasKit until the Provider renders the first time,
// since we currently support setting the wasm path at runtime when the app starts,
// which needs to happen before `loadCanvasKit` is called.
let suspendedCanvasKit: SuspendedValue<CanvasKit>;

const CanvasKitContext = createContext<CanvasKit | undefined>(undefined);

export const CanvasKitProvider = memo(function CanvasKitProvider({
  children,
  CanvasKit,
  library = '@noya-app/noya-canvaskit',
}: {
  children?: ReactNode;
  CanvasKit?: CanvasKit;
  library?: 'svgkit' | '@noya-app/noya-canvaskit';
}) {
  if (!CanvasKit && !suspendedCanvasKit) {
    if (library === 'svgkit') {
      suspendedCanvasKit = new SuspendedValue<CanvasKit>(
        import('noya-svgkit').then((module) => module.loadSVGKit()),
      );
    } else {
      suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadCanvasKit());
    }
  }

  const LoadedCanvasKit = CanvasKit ?? suspendedCanvasKit.getValueOrThrow();

  return (
    <CanvasKitContext.Provider value={LoadedCanvasKit}>
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
