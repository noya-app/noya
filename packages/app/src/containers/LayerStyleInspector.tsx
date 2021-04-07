import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import FillInspector from './FillInspector';
import withSeparatorElements from '../utils/withSeparatorElements';
import NameInspector from '../components/inspector/NameInspector';
import OpacityInspector from './OpacityInspector';
import BorderInspector from './BorderInspector';
import ShadowInspector from './ShadowInspector';

export default memo(function LayerStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedLayerStyles),
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setThemeStyleName',
        selectedStyles.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedStyles],
  );

  if (selectedStyles.length === 0) return null;

  const elements = [
    <NameInspector
      names={selectedStyles.map((v) => v.name)}
      onNameChange={handleNameChange}
    />,
    <OpacityInspector />,
    <FillInspector />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
