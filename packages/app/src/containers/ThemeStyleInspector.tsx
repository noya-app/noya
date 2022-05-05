import { memo, useCallback } from 'react';

import { Selectors } from 'noya-state';
import { delimitedPath } from 'noya-utils';
import { useShallowArray } from 'noya-react-utils';
import {
  FillInspector,
  BorderInspector,
  ShadowInspector,
  OpacityInspector,
} from 'noya-workspace-ui';
import { Layout, withSeparatorElements } from 'noya-designsystem';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import NameInspector from '../components/inspector/NameInspector';

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
    <FillInspector title="Fills" allowMoreThanOne />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Layout.Divider />)}</>;
});
