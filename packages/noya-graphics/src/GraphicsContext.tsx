import type { CanvasKit } from '@noya-app/noya-canvaskit';
import React, { memo, ReactNode } from 'react';
import { CanvasKitProvider } from './CanvasKitContext';
import { ComponentsProvider } from './ComponentsContext';
import { IComponents } from './types';

export const GraphicsProvider = memo(function GraphicsProvider({
  children,
  CanvasKit,
  Components,
}: {
  children?: ReactNode;
  CanvasKit: CanvasKit;
  Components: IComponents;
}) {
  return (
    <CanvasKitProvider value={CanvasKit}>
      <ComponentsProvider value={Components}>{children}</ComponentsProvider>
    </CanvasKitProvider>
  );
});
