import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import { useSelector } from '../contexts/ApplicationStateContext';
import SwatchesGroups from './SwatchesGroups';

export default memo(function ThemeGroups() {
  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const element = useMemo(() => {
    switch (tab) {
      case 'swatches':
        return <SwatchesGroups />;
      case 'layerStyles':
        return <></>;
    }
    return null;
  }, [tab]);

  return <>{element}</>;
});
