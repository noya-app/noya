import { memo, useCallback } from 'react';

import { Selectors } from 'noya-state';
import { delimitedPath } from 'noya-utils';
import { useShallowArray } from 'noya-react-utils';
import { OpacityInspector } from 'noya-workspace-ui';
import { Divider, withSeparatorElements } from 'noya-web-designsystem';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import NameInspector from '../components/inspector/NameInspector';
import FillInspector from './FillInspector';
import BorderInspector from './BorderInspector';
import ShadowInspector from './ShadowInspector';

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

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
