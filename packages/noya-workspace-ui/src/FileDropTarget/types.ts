import type { ReactNode } from 'react';
import type { OffsetPoint } from '../types';

export type TypedFile<T> = File & { type: T };

export interface FileDropTargetProps<T extends string> {
  children: ReactNode | ((isActive: boolean) => ReactNode);
  onDropFiles: (file: TypedFile<T>[], offsetPoint: OffsetPoint) => void;
  supportedFileTypes: T[];
}
