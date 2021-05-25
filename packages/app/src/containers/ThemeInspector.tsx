import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import { useSelector } from '../contexts/ApplicationStateContext';
import SwatchInspector from './SwatchesInspector';
import ThemeTextStyleInspector from './ThemeTextStyleInspector';
import ThemeStyleInspector from './ThemeStyleInspector';
import ThemeSymbolsInspector from './ThemeSymbolsInspector';

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
