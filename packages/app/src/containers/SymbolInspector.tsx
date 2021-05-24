import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import SymbolSourceRow from '../components/inspector/SymbolSourceRow';
import SymbolLayoutRow from '../components/inspector/SymbolLayoutRow';
import SymbolOverrideRow from '../components/inspector/SymbolOverrideRow';

import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Divider } from 'noya-designsystem';

export default memo(function SymbolInspector() {
  const [, dispatch] = useApplicationState();

  const selectedSymbol = useShallowArray(
    useSelector(Selectors.getSelectedSymbols),
  )[0];

  const elements = [
    <SymbolSourceRow
      resizesContent={selectedSymbol.resizesContent}
      hasBackgroundColor={selectedSymbol.hasBackgroundColor}
      backgroundColor={selectedSymbol.backgroundColor}
      includeBackgroundColorInExport={
        selectedSymbol.includeBackgroundColorInExport
      }
      includeBackgroundColorInInstance={
        selectedSymbol.includeBackgroundColorInInstance
      }
      setAdjustContentOnResize={useCallback(
        (value) => {
          dispatch('setAdjustContentOnResize', value);
        },
        [dispatch],
      )}
      setHasBackgroundColor={useCallback(
        (value) => {
          dispatch('setHasBackgroundColor', value);
        },
        [dispatch],
      )}
      setBackgroundColor={useCallback(
        (value) => {
          dispatch('setBackgroundColor', value);
        },
        [dispatch],
      )}
      setIncludeBgInInstances={useCallback(
        (value) => {
          dispatch('setIncludeBackgroundColorInInstance', value);
        },
        [dispatch],
      )}
      setIncludeBgInExport={useCallback(
        (value) => {
          dispatch('setIncludeBackgroundColorInExport', value);
        },
        [dispatch],
      )}
    />,
    <SymbolLayoutRow
      groupLayout={selectedSymbol.groupLayout}
      setGroupLayout={useCallback(
        (value) => {
          dispatch('setGroupLayout', value !== '' ? value : undefined);
        },
        [dispatch],
      )}
      setLayoutAnchor={useCallback(
        (value) => {
          dispatch('setLayoutAnchor', value);
        },
        [dispatch],
      )}
      setMinWidth={useCallback(
        (value) => {
          dispatch('setMinWidth', value);
        },
        [dispatch],
      )}
    />,
    <SymbolOverrideRow
      layers={selectedSymbol.layers}
      allowsOverrides={selectedSymbol.allowsOverrides}
      overrideProperties={selectedSymbol.overrideProperties}
    />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
