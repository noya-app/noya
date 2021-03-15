import { Selectors } from 'noya-state';
import { rgbaToHex } from 'noya-colorpicker';
import { Fragment, memo, useMemo } from 'react';
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
      ? 'Multiple'
      : firstSwatch.name;

  const ids = state.selectedSwatchIds;
  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>{'Name'}</Title>
        <Spacer.Horizontal size={12} />
      </div>
      <ColorSelectRow
        id={`fill-${'color'}`}
        color={selectedSwatches[0].value}
        name={name}
        hexValue={rgbaToHex(firstColor)}
        onChangeOpacity={(value) => dispatch('setSwatchOpacity', ids, value)}
        onNudgeOpacity={(value) =>
          dispatch('setSwatchOpacity', ids, value, 'adjust')
        }
        onChangeColor={(value) => dispatch('setSwatchColor', ids, value)}
        onInputChange={(value) => dispatch('setSwatchName', ids, value)}
      />
    </Container>
  );
});

export default memo(function SwatchesInspector() {
  const currentTab = useSelector(Selectors.getCurrentTab);

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

  if (!(currentTab === 'components') || selectedSwatches.length === 0) {
    return null;
  }

  return <>{elements}</>;
});
