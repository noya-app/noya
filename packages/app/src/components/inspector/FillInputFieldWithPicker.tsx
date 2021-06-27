import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import { ColorInputField, Select, SketchPattern } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';
import GradientInspector from './GradientInspector';
import PatternInspector from './PatternInspector';
import { uuid } from 'noya-renderer';
import ColorPickerSwatches from './PickerSwatches';
import ColorPickerGradient from './PickerGradients';
import ColorPickerPattern from './PickerPattern';

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflowY: 'auto',
}));

const StyledArrow = styled(Popover.Arrow)(({ theme }) => ({
  fill: theme.colors.popover.background,
}));

const PaddedSection = styled.section({
  padding: '7px 10px',
  display: 'flex',
  flexDirection: 'column',
});

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
}));

type FillOption =
  | 'Solid Color'
  | 'Linear Gradient'
  | 'Radial Gradient'
  | 'Angular Gradient'
  | 'Pattern Fill';

interface Props {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
  onChange: (color: Sketch.Color) => void;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradient?: (type: Sketch.Gradient) => void;
  onChangeGradientColor?: (color: Sketch.Color, index: number) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
  onChangeGradientPosition?: (index: number, position: number) => void;
  onAddGradientStop?: (color: Sketch.Color, position: number) => void;
  onDeleteGradientStop?: (index: number) => void;
  onChangePatternFillType?: (value: Sketch.PatternFillType) => void;
  onChangePatternTileScale?: (amount: number) => void;
  onChangeFillImage?: (value: Sketch.FileRef | Sketch.DataRef) => void;
}

interface PickersProps {
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
  onChange: (color: Sketch.Color) => void;
  onChangeGradient?: (type: Sketch.Gradient) => void;
  onChangeFillImage?: (value: Sketch.FileRef | Sketch.DataRef) => void;
}

const Picker = ({
  value,
  onChange,
  onChangeGradient,
  onChangeFillImage,
}: PickersProps) => {
  const [state, dispatch] = useApplicationState();

  const detachThemeColor = useCallback(() => {
    if (!value || value._class !== 'color') return;

    onChange({
      ...value,
      swatchID: undefined,
    });
  }, [onChange, value]);

  const createThemeColor = useCallback(() => {
    if (!value || value._class !== 'color') return;

    const swatchName = prompt('New Swatch Name');

    if (!swatchName) return;

    const id = uuid();
    onChange({
      ...value,
      swatchID: id,
    });
    dispatch('addSwatch', swatchName, value, id);
  }, [onChange, dispatch, value]);

  const createThemeGradient = useCallback(() => {
    if (!value || value._class !== 'gradient') return;

    const gradientName = prompt('New Gradient Assets Name');
    if (!gradientName) return;

    dispatch('addGradientAsset', gradientName, value);
  }, [dispatch, value]);

  const onRemoveThemeGradient = useCallback(
    (id: string) => dispatch('removeGradientAsset', id),
    [dispatch],
  );

  const onRenameThemeGradient = useCallback(
    (id: string, name: string) => dispatch('setGradientAssetName', id, name),
    [dispatch],
  );

  const element = useMemo(() => {
    switch (value?._class) {
      case undefined:
      case 'color':
        return (
          <ColorPickerSwatches
            swatchID={value?._class === 'color' ? value.swatchID : undefined}
            sharedSwatches={Selectors.getSharedSwatches(state)}
            onChange={onChange}
            onCreate={createThemeColor}
            onDetach={detachThemeColor}
          />
        );
      case 'gradient':
        return (
          <ColorPickerGradient
            gradientType={value.gradientType}
            gradientAssets={Selectors.getGradientAssets(state)}
            onCreate={createThemeGradient}
            onChange={onChangeGradient}
            onDelete={onRemoveThemeGradient}
            onRename={onRenameThemeGradient}
          />
        );
      case 'pattern':
        return (
          <ColorPickerPattern
            fileImages={state.sketch.images}
            imageAssets={Selectors.getImageAssets(state)}
            onChange={onChangeFillImage}
          />
        );
    }
  }, [
    state,
    value,
    onChange,
    onChangeGradient,
    createThemeColor,
    onChangeFillImage,
    detachThemeColor,
    createThemeGradient,
    onRemoveThemeGradient,
    onRenameThemeGradient,
  ]);

  return <>{element} </>;
};

export default memo(function ColorInputFieldWithPicker({
  id,
  value,
  onChange,
  onChangeType,
  onChangeGradient,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
  onDeleteGradientStop,
  onChangeGradientType,
  onChangePatternFillType,
  onChangePatternTileScale,
  onChangeFillImage,
}: Props) {
  const [state, dispatch] = useApplicationState();

  const createImage = useCallback(
    (data: ArrayBuffer, _ref: string) => {
      dispatch('addImage', data, _ref);
    },
    [dispatch],
  );

  const options: FillOption[] = useMemo(
    () => [
      'Solid Color',
      'Linear Gradient',
      'Radial Gradient',
      'Angular Gradient',
      'Pattern Fill',
    ],
    [],
  );

  const fillOption = useMemo(() => {
    if (!value) return 'Solid Color';

    switch (value._class) {
      case 'color':
        return 'Solid Color';
      case 'pattern':
        return 'Pattern Fill';
      case 'gradient':
        return `${
          Sketch.GradientType[value.gradientType]
        } Gradient` as FillOption;
    }
  }, [value]);

  const handleFillOptionChange = useCallback(
    (value: FillOption) => {
      if (onChangeType)
        onChangeType(
          value.endsWith('Gradient')
            ? Sketch.FillType.Gradient
            : value === 'Pattern Fill'
            ? Sketch.FillType.Pattern
            : Sketch.FillType.Color,
        );

      if (value.endsWith('Gradient') && onChangeGradientType)
        onChangeGradientType(
          value === 'Linear Gradient'
            ? Sketch.GradientType.Linear
            : value === 'Radial Gradient'
            ? Sketch.GradientType.Radial
            : Sketch.GradientType.Angular,
        );
    },
    [onChangeType, onChangeGradientType],
  );

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField id={id} value={value} />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <PaddedSection>
          <Row>
            <Select
              id="fill-options"
              value={fillOption}
              options={options}
              onChange={handleFillOptionChange}
            />
          </Row>
        </PaddedSection>
        <PaddedSection>
          {!value || value._class === 'color' ? (
            <ColorInspector
              id={`${id}-color-inspector`}
              color={value}
              onChangeColor={onChange}
            />
          ) : value._class === 'gradient' ? (
            <GradientInspector
              id={`${id}-gradient-inspector`}
              gradient={value.stops}
              onChangeColor={onChangeGradientColor}
              onChangePosition={onChangeGradientPosition}
              onAddStop={onAddGradientStop}
              onDeleteStop={onDeleteGradientStop}
            />
          ) : (
            <PatternInspector
              id={`${id}-pattern-inspector`}
              pattern={value}
              images={state.sketch.images}
              createImage={createImage}
              onChangeImage={onChangeFillImage}
              onChangeFillType={onChangePatternFillType}
              onChangeTileScale={onChangePatternTileScale}
            />
          )}
        </PaddedSection>
        <Picker
          value={value}
          onChange={onChange}
          onChangeGradient={onChangeGradient}
          onChangeFillImage={onChangeFillImage}
        />
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
