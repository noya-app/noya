import React, { Children, memo, ReactNode, useCallback, useMemo } from 'react';
import { ArrayController } from './ArrayController';

interface Props {
  id: string;
  title: string;
  isEnabled: boolean;
  onChangeIsEnabled: (value: boolean) => void;
  children: ReactNode;
}

export const EnableableElementController = memo(
  function EnableableElementController({
    id,
    title,
    isEnabled,
    onChangeIsEnabled,
    children,
  }: Props) {
    const setEnabled = useCallback(
      () => onChangeIsEnabled(true),
      [onChangeIsEnabled],
    );

    const setDisabled = useCallback(
      () => onChangeIsEnabled(false),
      [onChangeIsEnabled],
    );

    const childrenArray = useMemo(
      () => (isEnabled ? Children.toArray(children) : []),
      [children, isEnabled],
    );

    return (
      <ArrayController<ReactNode>
        id={id}
        title={title}
        items={childrenArray}
        onClickPlus={isEnabled ? undefined : setEnabled}
        onClickTrash={isEnabled ? setDisabled : undefined}
        renderItem={useCallback(({ item }) => item, [])}
      />
    );
  },
);
