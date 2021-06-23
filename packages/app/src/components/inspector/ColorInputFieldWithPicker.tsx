import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import { ColorInputField, Select } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';
import GradientInspector from './GradientInspector';
import PatternInspector from './PatternInspector';
import { uuid } from 'noya-renderer';
import ColorPickerSwatches from './ColorPickerSwatches';
import ColorPickerGradient from './ColorPickerGradients';

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

export type SketchPattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};

interface Props {
  id?: string;
  value: Sketch.Color | Sketch.Gradient | SketchPattern;
  onChange: (color: Sketch.Color) => void;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradient?: (type: Sketch.Gradient) => void;
  onChangeGradientColor?: (color: Sketch.Color, index: number) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
  onChangeGradientPosition?: (index: number, position: number) => void;
  onAddGradientStop?: (color: Sketch.Color, position: number) => void;
  onDeleteGradientStop?: (index: number) => void;
}

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
}: Props) {
  // TODO: The value prop here can be an array, and other
  // inspector rows may also take arrays
  const [state, dispatch] = useApplicationState();
  const sharedSwatches = Selectors.getSharedSwatches(state);
  const gradientAssets = Selectors.getGradientAssets(state);

  const values = useMemo(() => {
    if (value._class !== 'color') return [];
    return [value];
  }, [value]);

  const selectedColor = values[0];

  const detachThemeColor = useCallback(() => {
    onChange({
      ...selectedColor,
      swatchID: undefined,
    });
  }, [onChange, selectedColor]);

  const createThemeColor = useCallback(() => {
    const swatchName = prompt('New Swatch Name');
    if (!swatchName) return;

    const id = uuid();
    onChange({
      ...selectedColor,
      swatchID: id,
    });
    dispatch('addSwatch', swatchName, selectedColor, id);
  }, [onChange, dispatch, selectedColor]);

  const createThemeGradient = useCallback(() => {
    if (value._class !== 'gradient') return;

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

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField
          id={id}
          value={value._class === 'color' ? values[0] : value}
        />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <PaddedSection>
          <Row>
            <Select
              id="fill-options"
              value={fillOption}
              options={options}
              onChange={useCallback(
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
              )}
            />
          </Row>
        </PaddedSection>
        <PaddedSection>
          {value._class === 'color' ? (
            <ColorInspector
              id={`${id}-color-inspector`}
              colors={values}
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
            <PatternInspector id={`${id}-pattern-inspector`} pattern={value} />
          )}
        </PaddedSection>
        {value._class === 'color' ? (
          <ColorPickerSwatches
            swatchID={selectedColor.swatchID}
            sharedSwatches={sharedSwatches}
            onChange={onChange}
            onCreate={createThemeColor}
            onDetach={detachThemeColor}
          />
        ) : value._class === 'gradient' ? (
          <ColorPickerGradient
            gradientType={value.gradientType}
            gradientAssets={gradientAssets}
            onCreate={createThemeGradient}
            onChange={onChangeGradient}
            onDelete={onRemoveThemeGradient}
            onRename={onRenameThemeGradient}
          />
        ) : (
          <></>
        )}
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
