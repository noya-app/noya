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
import NameInspector from './NameInspector';
import OpacityInspector from './OpacityInspector';
import BorderInspector from './BorderInspector';
import ShadowInspector from './ShadowInspector';

export default memo(function LayerStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedLayerStyle),
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setLayerStyleName',
        selectedStyles.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedStyles],
  );

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

  if (selectedStyles.length === 0) return null;

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
