import { Divider, withSeparatorElements } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';
import FillInspector from './FillInspector';
import NameInspector from '../components/inspector/NameInspector';
import OpacityInspector from './OpacityInspector';
import BorderInspector from './BorderInspector';
import ShadowInspector from './ShadowInspector';
import { delimitedPath } from 'noya-utils';

export default memo(function ThemeStyleInspector() {
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
      names={selectedStyles.map((v) => delimitedPath.basename(v.name))}
      onNameChange={handleNameChange}
    />,
    <OpacityInspector />,
    <FillInspector title={'Fills'} allowMoreThanOne={true} />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
