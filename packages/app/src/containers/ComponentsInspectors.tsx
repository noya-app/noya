import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import { useSelector } from '../contexts/ApplicationStateContext';
import SwatchInspector from './SwatchesInspector';
import LayerStyleInspector from './LayerStyleInspector';

export default memo(function ComponentsInspectors() {
  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const element = useMemo(() => {
    switch (tab) {
      case 'swatches':
        return <SwatchInspector />;
      case 'layerStyles':
        return <LayerStyleInspector />;
    }
    return null;
  }, [tab]);

  return <>{element}</>;
});
