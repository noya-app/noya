import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorInputField,
  Divider,
  Select,
  SketchPattern,
} from 'noya-designsystem';
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
    <>
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
    </>
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
    <>
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
    </>
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
    <>
      <PatternInspector
        id={`${id}-pattern-inspector`}
        pattern={pattern}
        createImage={createImage}
        onChangeImage={onChangeFillImage}
        onChangeFillType={onChangePatternFillType}
        onChangeTileScale={onChangePatternTileScale}
      />
      <PickerPatterns
        imageAssets={Selectors.getImageAssets(state)}
        onChange={onChangeFillImage}
      />
    </>
  );
}

interface FillOptionSelectProps {
  fillType: Sketch.FillType;
  gradientType: Sketch.GradientType;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
  supportsGradients: boolean;
  supportsPatterns: boolean;
}

function FillOptionSelect({
  fillType,
  gradientType,
  onChangeType,
  onChangeGradientType,
  supportsGradients,
  supportsPatterns,
}: FillOptionSelectProps) {
  const fillOptions: FillOption[] = useMemo(
    () => [
      'Solid Color' as const,
      ...(supportsGradients
        ? [
            'Linear Gradient' as const,
            'Radial Gradient' as const,
            'Angular Gradient' as const,
          ]
        : []),
      ...(supportsPatterns ? ['Pattern Fill' as const] : []),
    ],
    [supportsGradients, supportsPatterns],
  );

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
      options={fillOptions}
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
  hasMultipleFills?: boolean;
  colorProps: ColorFillProps;
  gradientProps?: GradientFillProps;
  patternProps?: PatternFillProps;
}

export default memo(function FillInputFieldWithPicker({
  id,
  fillType,
  onChangeType,
  hasMultipleFills = false,
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
        <ColorInputField id={id} value={hasMultipleFills ? undefined : value} />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        {(gradientProps || patternProps) && (
          <>
            <InspectorPrimitives.Section>
              <InspectorPrimitives.Row>
                <FillOptionSelect
                  supportsGradients={!!gradientProps}
                  supportsPatterns={!!patternProps}
                  fillType={fillType ?? Sketch.FillType.Color}
                  gradientType={
                    gradientProps?.gradient.gradientType ??
                    Sketch.GradientType.Linear
                  }
                  onChangeType={onChangeType}
                  onChangeGradientType={gradientProps?.onChangeGradientType}
                />
              </InspectorPrimitives.Row>
            </InspectorPrimitives.Section>
            <Divider />
          </>
        )}
        {picker}
      </Content>
    </Popover.Root>
  );
});
