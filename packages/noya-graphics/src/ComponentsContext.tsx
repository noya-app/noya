import React, { createContext, memo, useContext } from 'react';
import { IComponents } from './types';

export type ComponentsContextValue = IComponents;

const ComponentsContext = createContext<ComponentsContextValue | undefined>(
  undefined,
);

export const ComponentsProvider = ComponentsContext.Provider;

function useComponents(): ComponentsContextValue {
  const value = useContext(ComponentsContext);

  if (!value) {
    throw new Error('Missing ComponentsProvider');
  }

  return value;
}

export type ComponentParameters<K extends keyof IComponents> = Parameters<
  IComponents[K]
>[0];

export const Rect = memo(function Rect(props: ComponentParameters<'Rect'>) {
  const { Rect } = useComponents();
  return <Rect {...props} />;
});

export const Path = memo(function Path(props: ComponentParameters<'Path'>) {
  const { Path } = useComponents();
  return <Path {...props} />;
});

export const Text = memo(function Text(props: ComponentParameters<'Text'>) {
  const { Text } = useComponents();
  return <Text {...props} />;
});

export const Image = memo(function Image(props: ComponentParameters<'Image'>) {
  const { Image } = useComponents();
  return <Image {...props} />;
});

export const Polyline = memo(function Polyline(
  props: ComponentParameters<'Polyline'>,
) {
  const { Polyline } = useComponents();
  return <Polyline {...props} />;
});

export const Group = memo(function Group(props: ComponentParameters<'Group'>) {
  const { Group } = useComponents();
  return <Group {...props} />;
});
