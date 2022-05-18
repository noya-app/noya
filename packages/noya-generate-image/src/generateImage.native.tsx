import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

import type { CanvasKit as PublicCanvasKit } from 'canvaskit-types';
import { Components, render, unmount } from 'noya-react-canvaskit';
import { StateProvider } from 'noya-app-state-context';
// import { SVGRenderer } from 'noya-svg-renderer';
import { WorkspaceState } from 'noya-state';
import { Theme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { UTF16 } from 'noya-utils';
import {
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
  FontManagerProvider,
} from 'noya-renderer';
import type { ImageEncoding } from './types';

export function generateImage(
  CanvasKit: PublicCanvasKit,
  width: number,
  height: number,
  theme: Theme,
  state: WorkspaceState,
  format: ImageEncoding,
  renderContent: () => ReactNode,
): Promise<Uint8Array | undefined> {
  return new Promise((resolve) => {});
}
