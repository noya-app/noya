import { Divider, withSeparatorElements } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import NameInspector from '../components/inspector/NameInspector';
import SymbolMasterInspector from './SymbolMasterInspector';
import { delimitedPath } from 'noya-utils';

export default memo(function ThemeSymbolsInspector() {
  const [, dispatch] = useApplicationState();

  const selectedSymbols = useShallowArray(
    useSelector(Selectors.getSelectedSymbols),
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setSymbolName',
        selectedSymbols.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedSymbols],
  );

  if (selectedSymbols.length === 0) return null;
  const showSymbolsInspector = selectedSymbols.length === 1;

  const elements = [
    <NameInspector
      names={selectedSymbols.map((v) => delimitedPath.basename(v.name))}
      onNameChange={handleNameChange}
    />,
    showSymbolsInspector && <SymbolMasterInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
