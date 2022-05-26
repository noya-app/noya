import React, { memo, useMemo, useCallback } from 'react';

import { useDispatch, useSelector } from 'noya-app-state-context';
import { Selectors } from 'noya-state';
import { useToolbarKeyCommands } from './utils';
import ButtonList from './ButtonList';

const ZoomMenu: React.FC = () => {
  const dispatch = useDispatch();
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const zoomLabel = useMemo(
    () => `${Math.floor(meta.zoomValue * 100)}%`,
    [meta.zoomValue],
  );

  const onZoom = useCallback(
    (type: 'zoomIn' | 'zoomOut') => () => {
      switch (type) {
        case 'zoomIn': {
          dispatch('setZoom*', 2, 'multiply');
          break;
        }
        case 'zoomOut': {
          dispatch('setZoom*', 0.5, 'multiply');
          break;
        }
      }
    },
    [dispatch],
  );

  const onResetZoom = useCallback(() => {
    dispatch('setZoom*', 1, 'replace');
  }, [dispatch]);

  const zoomItems = useMemo(
    () => [
      {
        icon: 'zoom-in',
        shortcut: { cmd: 'Mod-+', title: 'Zoom in', menuName: 'Edit' },
        onPress: onZoom('zoomIn'),
      },
      {
        shortcut: { cmd: 'Mod-0', title: 'Reset zoom', menuName: 'Edit' },
        label: zoomLabel,
        onPress: onResetZoom,
      },
      {
        shortcut: { cmd: 'Mod--', title: 'Zoom out', menuName: 'Edit' },
        icon: 'zoom-out',
        onPress: onZoom('zoomOut'),
      },
    ],
    [onZoom, onResetZoom, zoomLabel],
  );

  useToolbarKeyCommands(zoomItems);

  return <ButtonList items={zoomItems} />;
};

export default memo(ZoomMenu);
