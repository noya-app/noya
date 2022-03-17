import type { ReactElement } from 'react';

import type { ApplicationMenuItem } from 'noya-embedded';

export const SEPARATOR_ITEM = 'separator';
export const CHECKBOX_WIDTH = 15;
export const CHECKBOX_RIGHT_INSET = 3;

export type RegularMenuItem<T extends string> = {
  value?: T;
  title: string;
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  icon?: ReactElement;
  items?: MenuItem<T>[];
  role?:
    | ApplicationMenuItem['role']
    | 'recentdocuments'
    | 'clearrecentdocuments';
};

export type MenuItem<T extends string> =
  | typeof SEPARATOR_ITEM
  | RegularMenuItem<T>;
