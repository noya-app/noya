import { useSelector } from 'noya-app-state-context';
import { Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import SwatchInspector from './SwatchesInspector';
import ThemeStyleInspector from './ThemeStyleInspector';
import ThemeSymbolsInspector from './ThemeSymbolsInspector';
import ThemeTextStyleInspector from './ThemeTextStyleInspector';

export default memo(function ThemeInspector() {
  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const element = useMemo(() => {
    switch (tab) {
      case 'swatches':
        return <SwatchInspector />;
      case 'textStyles':
        return <ThemeTextStyleInspector />;
      case 'layerStyles':
        return <ThemeStyleInspector />;
      case 'symbols':
        return <ThemeSymbolsInspector />;
      default:
        return null;
    }
  }, [tab]);

  return <>{element}</>;
});
