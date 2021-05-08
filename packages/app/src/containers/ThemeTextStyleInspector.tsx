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
import { delimitedPath } from 'noya-utils';
import TextStyleInspector from './TextStyleInspector';

export default memo(function ThemeTextStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedThemeTextStyles),
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setTextStyleName',
        selectedStyles.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedStyles],
  );

  if (selectedStyles.length === 0) return null;

  const elements = [
    <NameInspector
      names={selectedStyles.map((v) => delimitedPath.basename(v.name))}
      onNameChange={handleNameChange}
    />,
    <TextStyleInspector />,
    <OpacityInspector />,
    <FillInspector />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
