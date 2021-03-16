import { Selectors } from 'noya-state';
import { rgbaToHex } from 'noya-colorpicker';
import { Fragment, memo, useMemo, useCallback } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import ColorSelectRow from '../components/inspector/ColorSelectRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';
import { Divider, Spacer } from 'noya-designsystem';
import styled from 'styled-components';

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

  const firstColor = {
    r: Math.round(firstSwatch.value.red * 255),
    g: Math.round(firstSwatch.value.green * 255),
    b: Math.round(firstSwatch.value.blue * 255),
    a: firstSwatch.value.alpha,
  };

  let sameName = () =>
    selectedSwatches.every((v) => v.name === firstSwatch.name);

  const name =
    selectedSwatches.length > 1 &&
    (firstSwatch.name === 'New Color Variable' || !sameName())
      ? undefined
      : firstSwatch.name;

  const ids = state.selectedSwatchIds;
  return (
    <Container>
      <Title>{'Name'}</Title>
      <Spacer.Vertical size={12} />
      <ColorSelectRow
        id={'color-swatch'}
        color={selectedSwatches[0].value}
        name={name}
        hexValue={rgbaToHex(firstColor).slice(1)}
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
