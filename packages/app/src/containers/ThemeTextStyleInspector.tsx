import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Divider, withSeparatorElements } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Selectors } from 'noya-state';
import { delimitedPath } from 'noya-utils';
import React, { memo, useCallback } from 'react';
import NameInspector from '../components/inspector/NameInspector';
import BorderInspector from './BorderInspector';
import FillInspector from './FillInspector';
import OpacityInspector from './OpacityInspector';
import ShadowInspector from './ShadowInspector';
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
