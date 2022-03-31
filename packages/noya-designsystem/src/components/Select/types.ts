import { CSSProperties, ReactNode } from 'react';

export interface SelectOptionProps<T extends string> {
  value: T;
  title?: string;
  onSelect?: () => void;
}

export type ChildrenProps<T> =
  | { children: ReactNode }
  | {
      options: T[];
      getTitle?: (option: T, index: number) => string;
      onChange: (value: T) => void;
    };

export type SelectProps<T extends string> = ChildrenProps<T> & {
  id?: string;
  flex?: CSSProperties['flex'];
  value: T;
};
