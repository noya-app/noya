import { Divider, withSeparatorElements } from 'noya-web-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import NameInspector from '../components/inspector/NameInspector';
import {
  OpacityInspector,
  BorderInspector,
  ShadowInspector,
  FillInspector,
} from 'noya-workspace-ui';
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
    <FillInspector title="Fills" allowMoreThanOne />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
