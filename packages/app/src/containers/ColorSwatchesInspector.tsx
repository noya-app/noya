import { Divider, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { Fragment, memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorSelectRow from '../components/inspector/ColorInspector';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import { sketchColorToHex } from 'noya-designsystem';
import withSeparatorElements from '../utils/withSeparatorElements';

const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',
}));

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
  const firstSwatch = selectedSwatches[0];

  const name =
    selectedSwatches.length > 1 &&
    !selectedSwatches.every((v) => v.name === firstSwatch.name)
      ? undefined
      : firstSwatch.name;

  const firstSwatchHex = sketchColorToHex(firstSwatch.value);
  const hexValue = useMemo(
    () =>
      selectedSwatches.length > 1 &&
      !selectedSwatches.every(
        (v) => sketchColorToHex(v.value) === firstSwatchHex,
      )
        ? undefined
        : firstSwatchHex.slice(1).toUpperCase(),
    [firstSwatchHex, selectedSwatches],
  );

  const ids = state.selectedSwatchIds;

  return (
    <Container>
      <Title>Name</Title>
      <Spacer.Vertical size={4} />
      <ColorSelectRow
        id={'color-swatch'}
        color={firstSwatch.value}
        name={name}
        hexValue={hexValue}
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
        onInputChange={useCallback(
          (value) => dispatch('setSwatchName', ids, value),
          [dispatch, ids],
        )}
      />
    </Container>
  );
});

export default memo(function SwatchesInspector() {
  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  const elements = useMemo(() => {
    const views = [
      <Fragment key="layout">
        <ColorPickerInspector />
        <Spacer.Vertical size={10} />
      </Fragment>,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, []);

  if (selectedSwatches.length === 0) {
    return null;
  }

  return <>{elements}</>;
});
