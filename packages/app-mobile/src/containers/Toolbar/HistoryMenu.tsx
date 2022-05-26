import React, { memo, useMemo, useCallback } from 'react';

import { useDispatch } from 'noya-app-state-context';
import { useHistory } from 'noya-workspace-ui';
import { useToolbarKeyCommands } from './utils';
import ButtonList from './ButtonList';

const HistoryMenu: React.FC = () => {
  const dispatch = useDispatch();
  const { redoDisabled, undoDisabled } = useHistory();

  const onHistoryAction = useCallback(
    (action: 'undo' | 'redo') => () => {
      switch (action) {
        case 'undo': {
          dispatch('undo');
          break;
        }
        case 'redo': {
          dispatch('redo');
          break;
        }
      }
    },
    [dispatch],
  );

  const historyItems = useMemo(
    () => [
      {
        icon: 'thick-arrow-left',
        disabled: undoDisabled,
        onPress: onHistoryAction('undo'),
        shortcut: {
          cmd: 'Mod-z',
          title: 'Undo',
          menuName: 'Edit',
        },
      },
      {
        icon: 'thick-arrow-right',
        disabled: redoDisabled,
        onPress: onHistoryAction('redo'),
        shortcut: {
          cmd: 'Mod-Shift-z',
          title: 'Redo',
          menuName: 'Edit',
        },
      },
    ],
    [onHistoryAction, undoDisabled, redoDisabled],
  );

  useToolbarKeyCommands(historyItems);

  return <ButtonList items={historyItems} />;
};

export default memo(HistoryMenu);
