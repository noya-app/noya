import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useSelector, useDispatch } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import SymbolSelectorRow from '../components/inspector/SymbolSelectorRow';
import SymbolInstanceOverridesRow from '../components/inspector/SymbolInstanceOverridesRow';
import { Divider } from 'noya-designsystem';

export default memo(function SymbolMasterInspector() {
  const dispatch = useDispatch();

  const selectedSymbolIntance = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  )[0] as Sketch.SymbolInstance;

  const symbolMaster = useShallowArray(useSelector(Selectors.getSymbols)).find(
    (symbol: Sketch.SymbolMaster) =>
      symbol.symbolID === selectedSymbolIntance.symbolID,
  );

  const onSetOverrideValue = useCallback(
    (overrideName: string, value: string) => {
      const [, type] = overrideName.split('_');

      if (type === 'symbolID')
        dispatch('setOverrideSymbolId', overrideName, value);
      else dispatch('setOverrideTextValue', overrideName, value);
    },
    [dispatch],
  );

  const elements = [
    <SymbolSelectorRow
      symbolId={selectedSymbolIntance.symbolID}
      onSelect={useCallback(
        (value) => {
          dispatch('setInstanceSymbolSource', value);
        },
        [dispatch],
      )}
      onDetach={useCallback(
        () => dispatch('detachSymbol', selectedSymbolIntance.do_objectID),
        [dispatch, selectedSymbolIntance.do_objectID],
      )}
      onEditSource={useCallback(
        () => dispatch('goToSymbolSource', selectedSymbolIntance.symbolID),
        [dispatch, selectedSymbolIntance.symbolID],
      )}
    />,
    symbolMaster && (
      <SymbolInstanceOverridesRow
        overrideValues={selectedSymbolIntance.overrideValues}
        symbolMaster={symbolMaster}
        onSetOverrideValue={onSetOverrideValue}
      />
    ),
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
