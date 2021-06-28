import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ColorInputField, Select, SketchPattern } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import ColorInspector from './ColorInspector';
import GradientInspector from './GradientInspector';
import PatternInspector from './PatternInspector';
import PickerGradients from './PickerGradients';
import PickerPatterns from './PickerPatterns';
import ColorPickerSwatches from './PickerSwatches';

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflowY: 'auto',
}));

const PaddedSection = styled.section({
  padding: '7px 10px',
  display: 'flex',
  flexDirection: 'column',
});

type FillOption =
  | 'Solid Color'
  | 'Linear Gradient'
  | 'Radial Gradient'
  | 'Angular Gradient'
  | 'Pattern Fill';

function ColorFillPicker({
  id,
  color,
  onChangeColor,
}: ColorFillProps & { id?: string }) {
  const [state, dispatch] = useApplicationState();

  const swatches = Selectors.getSharedSwatches(state);

  const onChangeSwatch = useCallback(
    (swatchID: string) => {
      const swatch = swatches.find((swatch) => swatch.do_objectID === swatchID);

      if (!swatch) return;

      onChangeColor({ ...swatch.value, swatchID });
    },
    [onChangeColor, swatches],
  );

  const detachThemeColor = useCallback(() => {
    if (!color) return;

    onChangeColor({ ...color, swatchID: undefined });
  }, [onChangeColor, color]);

  const createThemeColor = useCallback(
    (swatchID: string, name: string) => {
      if (!color) return;

      dispatch('addSwatch', name, color, swatchID);
      onChangeColor({ ...color, swatchID });
    },
    [color, dispatch, onChangeColor],
  );

  return (
    <PaddedSection>
      <ColorInspector
        id={`${id}-color-inspector`}
        color={color}
        onChangeColor={onChangeColor}
      />
      <ColorPickerSwatches
        selectedId={color ? color.swatchID : undefined}
        swatches={swatches}
        onChange={onChangeSwatch}
        onCreate={createThemeColor}
        onDetach={detachThemeColor}
      />
    </PaddedSection>
  );
}

function GradientFillPicker({
  id,
  gradient,
  onChangeGradient,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
  onDeleteGradientStop,
}: Omit<GradientFillProps, 'onChangeGradientType'> & { id?: string }) {
  const [state, dispatch] = useApplicationState();

  const gradientAssets = Selectors.getGradientAssets(state);

  const createThemeGradient = useCallback(() => {
    if (!gradient) return;

    const gradientName = prompt('New Gradient Assets Name');

    if (!gradientName) return;

    dispatch('addGradientAsset', gradientName, gradient);
  }, [dispatch, gradient]);

  const onRemoveThemeGradient = useCallback(
    (id: string) => dispatch('removeGradientAsset', id),
    [dispatch],
  );

  const onRenameThemeGradient = useCallback(
    (id: string, name: string) => dispatch('setGradientAssetName', id, name),
    [dispatch],
  );

  return (
    <PaddedSection>
      <GradientInspector
        id={`${id}-gradient-inspector`}
        gradient={gradient.stops}
        onChangeColor={onChangeGradientColor}
        onChangePosition={onChangeGradientPosition}
        onAddStop={onAddGradientStop}
        onDeleteStop={onDeleteGradientStop}
      />
      <PickerGradients
        gradientAssets={gradientAssets}
        onCreate={createThemeGradient}
        onChange={onChangeGradient}
        onDelete={onRemoveThemeGradient}
        onRename={onRenameThemeGradient}
      />
    </PaddedSection>
  );
}

function PatternFillPicker({
  id,
  pattern,
  onChangePatternFillType,
  onChangePatternTileScale,
  onChangeFillImage,
}: PatternFillProps & { id?: string }) {
  const [state, dispatch] = useApplicationState();

  const createImage = useCallback(
    (data: ArrayBuffer, _ref: string) => {
      dispatch('addImage', data, _ref);
    },
    [dispatch],
  );

  return (
    <PaddedSection>
      <PatternInspector
        id={`${id}-pattern-inspector`}
        pattern={pattern}
        images={state.sketch.images}
        createImage={createImage}
        onChangeImage={onChangeFillImage}
        onChangeFillType={onChangePatternFillType}
        onChangeTileScale={onChangePatternTileScale}
      />
      <PickerPatterns
        fileImages={state.sketch.images}
        imageAssets={Selectors.getImageAssets(state)}
        onChange={onChangeFillImage}
      />
    </PaddedSection>
  );
}

const FILL_OPTIONS: FillOption[] = [
  'Solid Color',
  'Linear Gradient',
  'Radial Gradient',
  'Angular Gradient',
  'Pattern Fill',
];

interface FillOptionSelectProps {
  fillType: Sketch.FillType;
  gradientType: Sketch.GradientType;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
}

function FillOptionSelect({
  fillType,
  gradientType,
  onChangeType,
  onChangeGradientType,
}: FillOptionSelectProps) {
  const value: FillOption = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Pattern:
        return 'Pattern Fill';
      case Sketch.FillType.Gradient:
        const gradientTypeString = Sketch.GradientType[gradientType];
        return `${gradientTypeString} Gradient` as FillOption;
      case Sketch.FillType.Color:
        return 'Solid Color';
    }
  }, [fillType, gradientType]);

  const handleChange = useCallback(
    (value: FillOption) => {
      if (!onChangeType) return;

      switch (value) {
        case 'Solid Color':
          onChangeType(Sketch.FillType.Color);
          break;
        case 'Linear Gradient':
        case 'Angular Gradient':
        case 'Radial Gradient':
          onChangeType(Sketch.FillType.Gradient);

          onChangeGradientType?.(
            value === 'Linear Gradient'
              ? Sketch.GradientType.Linear
              : value === 'Radial Gradient'
              ? Sketch.GradientType.Radial
              : Sketch.GradientType.Angular,
          );
          break;
        case 'Pattern Fill':
          onChangeType(Sketch.FillType.Pattern);
          break;
      }
    },
    [onChangeType, onChangeGradientType],
  );

  return (
    <Select
      id="fill-options"
      value={value}
      options={FILL_OPTIONS}
      onChange={handleChange}
    />
  );
}

export type ColorFillProps = {
  color?: Sketch.Color;
  onChangeColor: (color: Sketch.Color) => void;
};

export type GradientFillProps = {
  gradient: Sketch.Gradient;
  onChangeGradient: (type: Sketch.Gradient) => void;
  onChangeGradientColor: (color: Sketch.Color, index: number) => void;
  onChangeGradientType: (type: Sketch.GradientType) => void;
  onChangeGradientPosition: (index: number, position: number) => void;
  onAddGradientStop: (color: Sketch.Color, position: number) => void;
  onDeleteGradientStop: (index: number) => void;
};

export type PatternFillProps = {
  pattern: SketchPattern;
  onChangePatternFillType: (value: Sketch.PatternFillType) => void;
  onChangePatternTileScale: (amount: number) => void;
  onChangeFillImage: (value: Sketch.FileRef | Sketch.DataRef) => void;
};

interface Props {
  id: string;
  fillType?: Sketch.FillType;
  onChangeType?: (type: Sketch.FillType) => void;
  colorProps: ColorFillProps;
  gradientProps?: GradientFillProps;
  patternProps?: PatternFillProps;
}

export default memo(function FillInputFieldWithPicker({
  id,
  fillType,
  onChangeType,
  colorProps,
  gradientProps,
  patternProps,
}: Props) {
  const picker = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Gradient:
        return gradientProps ? (
          <GradientFillPicker id={id} {...gradientProps} />
        ) : null;
      case Sketch.FillType.Pattern:
        return patternProps ? (
          <PatternFillPicker id={id} {...patternProps} />
        ) : null;
      case Sketch.FillType.Color:
      case undefined:
        return <ColorFillPicker id={id} {...colorProps} />;
    }
  }, [id, fillType, colorProps, gradientProps, patternProps]);

  const value = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Gradient:
        return gradientProps?.gradient;
      case Sketch.FillType.Pattern:
        return patternProps?.pattern;
      case Sketch.FillType.Color:
      case undefined:
        return colorProps.color;
    }
  }, [
    fillType,
    colorProps.color,
    gradientProps?.gradient,
    patternProps?.pattern,
  ]);

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField id={id} value={value} />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <PaddedSection>
          <InspectorPrimitives.Row>
            <FillOptionSelect
              fillType={fillType ?? Sketch.FillType.Color}
              gradientType={
                gradientProps?.gradient.gradientType ??
                Sketch.GradientType.Linear
              }
              onChangeType={onChangeType}
              onChangeGradientType={gradientProps?.onChangeGradientType}
            />
          </InspectorPrimitives.Row>
        </PaddedSection>
        {picker}
      </Content>
    </Popover.Root>
  );
});
