import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import { useSelector } from '../contexts/ApplicationStateContext';
import SwatchesGroups from './SwatchesGroups';
import ThemeStylesGroups from './ThemeStylesGroups';
import ThemeTextStyleGroups from './ThemeTextStyleGroups';

export default memo(function ThemeGroups() {
  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const element = useMemo(() => {
    switch (tab) {
      case 'swatches':
        return <SwatchesGroups />;
      case 'textStyles':
        return <ThemeTextStyleGroups />;
      case 'layerStyles':
        return <ThemeStylesGroups />;
    }
    return null;
  }, [tab]);

  return <>{element}</>;
});
