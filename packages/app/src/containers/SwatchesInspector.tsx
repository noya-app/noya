import { Divider } from '@noya-app/noya-designsystem';
import { delimitedPath, isDeepEqual } from '@noya-app/noya-utils';
import { useShallowArray } from '@noya-app/react-utils';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { ColorInspector, NameInspector } from 'noya-inspector';
import { Selectors, getMultiValue } from 'noya-state';
import React, { memo, useCallback } from 'react';

export default memo(function SwatchesInspectors() {
  const [state, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedSwatches),
  );
  const ids = state.selectedThemeTab.swatches.ids;
  const color = getMultiValue(
    selectedSwatches.map((swatch) => swatch.value),
    isDeepEqual,
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setSwatchName',
        selectedSwatches.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedSwatches],
  );

  const handleSetOpacity = useCallback(
    (value, mode) => dispatch('setSwatchOpacity', ids, value, mode),
    [dispatch, ids],
  );

  const handleChangeColor = useCallback(
    (value) => dispatch('setSwatchColor', ids, value),
    [dispatch, ids],
  );

  if (selectedSwatches.length === 0) return null;

  return (
    <>
      <NameInspector
        names={selectedSwatches.map((v) => delimitedPath.basename(v.name))}
        onNameChange={handleNameChange}
      />
      <Divider />
      <ColorInspector
        id={'color-swatch'}
        color={color}
        onSetOpacity={handleSetOpacity}
        onChangeColor={handleChangeColor}
      />
    </>
  );
});
