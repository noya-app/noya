import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import NameInspector from '../components/inspector/NameInspector';
import OpacityInspector from './OpacityInspector';
import ShadowInspector from './ShadowInspector';
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

  const elements = [
    <NameInspector
      names={selectedSymbols.map((v) => delimitedPath.basename(v.name))}
      onNameChange={handleNameChange}
    />,
    <OpacityInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
