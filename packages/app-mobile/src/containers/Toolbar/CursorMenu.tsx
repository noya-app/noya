import React, { memo, useMemo, useCallback } from 'react';

import { useApplicationState } from 'noya-app-state-context';
import { Selectors, Layers } from 'noya-state';
import { useToolbarKeyCommands } from './utils';
import ButtonList from './ButtonList';

const CursorMenu: React.FC = () => {
  const [state, dispatch] = useApplicationState();

  const interactionType = useMemo(
    () => state.interactionState.type,
    [state.interactionState.type],
  );

  const isEditingPath = useMemo(
    () => Selectors.getIsEditingPath(interactionType),
    [interactionType],
  );

  const canStartEditingPath = useMemo(
    () =>
      interactionType === 'none' &&
      Selectors.getSelectedLayers(state).filter(Layers.isPointsLayer).length >
        0,
    [state, interactionType],
  );

  const onReset = useCallback(() => {
    dispatch('interaction', ['reset']);
  }, [dispatch]);

  const onEnablePenTool = useCallback(() => {
    if (isEditingPath) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['editPath']);
    }
  }, [isEditingPath, dispatch]);

  const cursorItems = useMemo(
    () => [
      {
        icon: 'cursor-arrow',
        onPress: onReset,
        active: interactionType === 'none' || interactionType === 'marquee',
        shortcut: {
          cmd: 'Escape',
          title: 'Reset interaction',
          menuName: 'Edit',
        },
      },
      {
        icon: 'point-mode',
        disabled: !(isEditingPath || canStartEditingPath),
        active: isEditingPath,
        onPress: onEnablePenTool,
        shortcut: {
          cmd: 'p',
          title: 'Edit path',
          menuName: 'Edit',
        },
      },
    ],
    [
      onReset,
      onEnablePenTool,
      interactionType,
      isEditingPath,
      canStartEditingPath,
    ],
  );

  useToolbarKeyCommands(cursorItems);

  return <ButtonList items={cursorItems} />;
};

export default memo(CursorMenu);
