import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import SymbolSourceRow from '../components/inspector/SymbolSourceRow';
import SymbolLayoutRow from '../components/inspector/SymbolLayoutRow';
import SymbolMasterOverrideRow from '../components/inspector/SymbolMasterOverrideRow';
import { useDispatch, useSelector } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import { Divider, withSeparatorElements } from 'noya-web-designsystem';

export default memo(function SymbolMasterInspector() {
  const dispatch = useDispatch();

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
      setIncludeBackgroundInInstances={useCallback(
        (value) => {
          dispatch('setIncludeBackgroundColorInInstance', value);
        },
        [dispatch],
      )}
      setIncludeBackgroundInExport={useCallback(
        (value) => {
          dispatch('setIncludeBackgroundColorInExport', value);
        },
        [dispatch],
      )}
    />,
    <SymbolLayoutRow
      groupLayout={selectedSymbol.groupLayout}
      setLayoutAxis={useCallback(
        (value) => {
          dispatch('setLayoutAxis', value);
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
        (value, mode) => {
          dispatch('setMinWidth', value, mode);
        },
        [dispatch],
      )}
    />,
    <SymbolMasterOverrideRow
      symbolMaster={selectedSymbol}
      onSetAllowsOverrides={useCallback(
        (value) => {
          dispatch('setAllowsOverrides', value);
        },
        [dispatch],
      )}
      onSetOverrideProperty={useCallback(
        (overrideName, value) => {
          dispatch('onSetOverrideProperty', overrideName, value);
        },
        [dispatch],
      )}
    />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
