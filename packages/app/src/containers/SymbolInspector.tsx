import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import SymbolSourceRow from '../components/inspector/SymbolSourceRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function SymbolInspector() {
  const [, dispatch] = useApplicationState();

  const selectedSymbol = useShallowArray(
    useSelector(Selectors.getSelectedSymbols),
  )[0];

  return (
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
    />
  );
});
