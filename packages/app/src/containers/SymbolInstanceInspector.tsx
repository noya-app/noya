import Sketch from 'noya-file-format';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import SymbolSelectorRow from '../components/inspector/LinkedSymbolRow';
import SymbolInstanceOverridesRow from '../components/inspector/SymbolInstanceOverridesRow';
import { Divider, withSeparatorElements } from 'noya-web-designsystem';
import { FillInspector } from 'noya-workspace-ui';

export default memo(function SymbolMasterInspector() {
  const dispatch = useDispatch();

  const selectedSymbolInstance = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  )[0] as Sketch.SymbolInstance;

  const symbolMaster = useShallowArray(useSelector(Selectors.getSymbols)).find(
    (symbol: Sketch.SymbolMaster) =>
      symbol.symbolID === selectedSymbolInstance.symbolID,
  );

  const onSetOverrideValue = useCallback(
    (overrideName: string, value: string) => {
      dispatch(
        'setOverrideValue',
        overrideName,
        value === '' ? undefined : value,
      );
    },
    [dispatch],
  );

  const onResetOverrideValue = useCallback(() => {
    dispatch('setOverrideValue');
  }, [dispatch]);

  const elements = [
    <SymbolSelectorRow
      symbolId={selectedSymbolInstance.symbolID}
      onSelect={useCallback(
        (value) => {
          dispatch('setInstanceSymbolSource', value);
        },
        [dispatch],
      )}
      onDetach={useCallback(
        () => dispatch('detachSymbol', selectedSymbolInstance.do_objectID),
        [dispatch, selectedSymbolInstance.do_objectID],
      )}
      onEditSource={useCallback(
        () => dispatch('goToSymbolSource', selectedSymbolInstance.symbolID),
        [dispatch, selectedSymbolInstance.symbolID],
      )}
    />,
    <FillInspector title={'Tint'} allowMoreThanOne={false} />,
    symbolMaster && (
      <SymbolInstanceOverridesRow
        overrideValues={selectedSymbolInstance.overrideValues}
        symbolMaster={symbolMaster}
        onSetOverrideValue={onSetOverrideValue}
        onResetOverrideValue={onResetOverrideValue}
      />
    ),
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
