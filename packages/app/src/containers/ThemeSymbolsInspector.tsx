import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Divider, withSeparatorElements } from 'noya-designsystem';
import { NameInspector } from 'noya-inspector';
import { useShallowArray } from 'noya-react-utils';
import { Selectors } from 'noya-state';
import { delimitedPath } from 'noya-utils';
import React, { memo, useCallback } from 'react';
import SymbolMasterInspector from './SymbolMasterInspector';

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
