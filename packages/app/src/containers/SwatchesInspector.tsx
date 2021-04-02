import { InputField, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { Fragment, memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorSelectRow from '../components/inspector/ColorInspector';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import useShallowArray from '../hooks/useShallowArray';

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

interface Props {
  selected: string[];
  onNameChange: (value: any) => void;
}

const NameInspector = memo(function NameInspector({
  selected,
  onNameChange,
}: Props) {
  const first = selected[0];
  const name =
    selected.length > 1 && !selected.every((v) => v === first)
      ? undefined
      : first;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Name</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <InputField.Root id={'colorName'}>
          <InputField.Input
            value={name || ''}
            placeholder={name === undefined ? 'Multiple' : ''}
            onChange={onNameChange}
          />
        </InputField.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});

export default memo(function ComponentsInspectors() {
  const [, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  if (selectedSwatches.length === 0) return null;

  return (
    <Fragment key="layout">
      <NameInspector
        selected={selectedSwatches.map((v) => v.name)}
        onNameChange={(value) =>
          dispatch(
            'setSwatchName',
            selectedSwatches.map((v) => v.do_objectID),
            value,
          )
        }
      />
      <ColorPickerInspector />
      <Spacer.Vertical size={10} />
    </Fragment>
  );
});
