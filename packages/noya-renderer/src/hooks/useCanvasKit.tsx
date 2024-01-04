import type { CanvasKit } from '@noya-app/noya-canvaskit';
import {
  CanvasKitProvider as CKProvider,
  useCanvasKit as useCK,
} from '@noya-app/noya-graphics';
import { SuspendedValue } from '@noya-app/react-utils';
import React, { memo, ReactNode } from 'react';
import { loadCanvasKit } from '../loadCanvasKit';

// We don't start loading CanvasKit until the Provider renders the first time,
// since we currently support setting the wasm path at runtime when the app starts,
// which needs to happen before `loadCanvasKit` is called.
let suspendedCanvasKit: SuspendedValue<CanvasKit>;

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

  return <CKProvider value={LoadedCanvasKit}>{children}</CKProvider>;
});

export const useCanvasKit = useCK;
