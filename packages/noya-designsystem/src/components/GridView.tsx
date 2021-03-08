import {
    Children,
    createContext,
    isValidElement,
    memo,
    ReactNode,
    useCallback,
    useContext,
  } from 'react';

  export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';
  type GridContextValue = {
    position: ListRowPosition;
    selectedPosition: ListRowPosition;
    sortable: boolean;
  };