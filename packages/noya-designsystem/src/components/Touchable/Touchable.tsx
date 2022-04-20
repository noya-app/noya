import React, { createContext } from 'react';
import { TouchableProps, TouchableContextType } from './types';

export const TouchableContext = createContext<TouchableContextType>([]);

export const TouchableListener: React.FC<TouchableProps> = (props) => {
  console.warn('Touchable.tsx not implemented!');

  return null;
};

export const Touchable: React.FC<TouchableProps> = (props) => {
  console.warn('Touchable.tsx not implemented!');

  return null;
};
