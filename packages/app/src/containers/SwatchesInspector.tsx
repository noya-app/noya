import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorInspector from '../components/inspector/ColorInspector';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import NameInspector from '../components/inspector/NameInspector';
import { delimitedPath } from 'noya-utils';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

export default memo(function SwatchesInspectors() {
  const [state, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedSwatches),
  );
  const ids = state.selectedSwatchIds;
  const colors = useMemo(() => selectedSwatches.map((swatch) => swatch.value), [
    selectedSwatches,
  ]);

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setSwatchName',
        selectedSwatches.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedSwatches],
  );

  const handleChangeOpacity = useCallback(
    (value) => dispatch('setSwatchOpacity', ids, value),
    [dispatch, ids],
  );
  const handleNudgeOpacity = useCallback(
    (value) => dispatch('setSwatchOpacity', ids, value, 'adjust'),
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
      <Container>
        <ColorInspector
          id={'color-swatch'}
          colors={colors}
          onChangeOpacity={handleChangeOpacity}
          onNudgeOpacity={handleNudgeOpacity}
          onChangeColor={handleChangeColor}
        />
      </Container>
    </>
  );
});
