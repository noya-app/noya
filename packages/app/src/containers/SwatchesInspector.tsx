import { Fragment, memo, useCallback, useMemo } from 'react';
import { Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import styled from 'styled-components';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import ColorSelectRow from '../components/inspector/ColorInspector';
import { useSelector } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import NameInspector from './NameInspector';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

const ColorPickerInspector = memo(function ColorPickerInspector() {
  const [state, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  const ids = state.selectedSwatchIds;
  const colors = useMemo(() => selectedSwatches.map((swatch) => swatch.value), [
    selectedSwatches,
  ]);

  return (
    <Container>
      <ColorSelectRow
        id={'color-swatch'}
        colors={colors}
        onChangeOpacity={useCallback(
          (value) => dispatch('setSwatchOpacity', ids, value),
          [dispatch, ids],
        )}
        onNudgeOpacity={useCallback(
          (value) => dispatch('setSwatchOpacity', ids, value, 'adjust'),
          [dispatch, ids],
        )}
        onChangeColor={useCallback(
          (value) => dispatch('setSwatchColor', ids, value),
          [dispatch, ids],
        )}
      />
    </Container>
  );
});

export default memo(function ComponentsInspectors() {
  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  if (selectedSwatches.length === 0) return null;

  return (
    <Fragment key="layout">
      <NameInspector
        names={selectedSwatches.map((v) => v.name)}
        ids={selectedSwatches.map((v) => v.do_objectID)}
      />
      <ColorPickerInspector />
      <Spacer.Vertical size={10} />
    </Fragment>
  );
});
