import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
  sketchColorToHex,
  SketchPattern,
  Spacer,
} from 'noya-designsystem';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import { SetNumberMode } from 'noya-state';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import DimensionInput from './DimensionInput';
import FillInputFieldWithPicker, {
  ColorFillProps,
  GradientFillProps,
  PatternFillProps,
} from './FillInputFieldWithPicker';
import { PATTERN_FILL_TYPE_OPTIONS, PatternFillType } from './PatternInspector';
import { DimensionValue } from './DimensionsInspector';

const GRADIENT_TYPE_OPTIONS = [
  Sketch.GradientType.Linear.toString(),
  Sketch.GradientType.Angular.toString(),
  Sketch.GradientType.Radial.toString(),
];

interface Props {
  id: string;
  prefix?: ReactNode;
  fillType?: Sketch.FillType;
  gradient?: Sketch.Gradient;
  pattern?: SketchPattern;
  contextOpacity: DimensionValue;
  onChangeFillType: (type: Sketch.FillType) => void;
  onSetOpacity: (amount: number, mode: SetNumberMode) => void;
  onSetContextOpacity: (value: number, mode: SetNumberMode) => void;
  colorProps: ColorFillProps;
  gradientProps: GradientFillProps;
  patternProps: PatternFillProps;
}

export default memo(function FillRow({
  id,
  prefix,
  fillType,
  contextOpacity,
  onSetOpacity,
  onSetContextOpacity,
  onChangeFillType,
  colorProps,
  gradientProps,
  patternProps,
}: Props) {
  const fillInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;
  const gradientTypeId = `${id}-gradient-type`;
  const patternSizeId = `${id}-pattern-type`;

  const fillLabel = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Color:
        return 'Color';
      case Sketch.FillType.Gradient:
        return 'Gradient';
      case Sketch.FillType.Pattern:
        return 'Image';
    }
  }, [fillType]);

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case fillInputId:
          return <Label.Label>{fillLabel}</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        case gradientTypeId:
          return <Label.Label>Type</Label.Label>;
        case patternSizeId:
          return <Label.Label>Size</Label.Label>;
        default:
          return null;
      }
    },
    [
      fillInputId,
      fillLabel,
      hexInputId,
      opacityInputId,
      gradientTypeId,
      patternSizeId,
    ],
  );

  const handleSetOpacity = useCallback(
    (amount: number, mode: SetNumberMode) => onSetOpacity(amount / 100, mode),
    [onSetOpacity],
  );

  const handleSetContextOpacity = useCallback(
    (amount: number, mode: SetNumberMode) =>
      onSetContextOpacity(amount / 100, mode),
    [onSetContextOpacity],
  );

  const getGradientTypeTitle = useCallback(
    (id: string) => Sketch.GradientType[parseInt(id)],
    [],
  );

  const handleSelectGradientType = useCallback(
    (value: string) => gradientProps.onChangeGradientType(parseInt(value)),
    [gradientProps],
  );

  const handleSelectPatternSize = useCallback(
    (value: PatternFillType) =>
      patternProps.onChangePatternFillType(Sketch.PatternFillType[value]),
    [patternProps],
  );

  const fields = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Color:
        return (
          <>
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.Input
                value={
                  colorProps.color
                    ? sketchColorToHex(colorProps.color).replace('#', '')
                    : ''
                }
                placeholder={colorProps.color ? undefined : 'multiple'}
                onSubmit={() => {}}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
            <Spacer.Horizontal size={8} />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                colorProps.color
                  ? Math.round(colorProps.color.alpha * 100)
                  : undefined
              }
              onSetValue={handleSetOpacity}
            />
          </>
        );
      case Sketch.FillType.Gradient:
        return (
          <>
            <Select
              id={gradientTypeId}
              value={gradientProps.gradient.gradientType.toString()}
              options={GRADIENT_TYPE_OPTIONS}
              getTitle={getGradientTypeTitle}
              onChange={handleSelectGradientType}
            />
            <Spacer.Horizontal size={8} />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                contextOpacity !== undefined
                  ? Math.round(contextOpacity * 100)
                  : undefined
              }
              onSetValue={handleSetContextOpacity}
            />
          </>
        );
      case Sketch.FillType.Pattern:
        return (
          <>
            <Select
              id={patternSizeId}
              value={
                Sketch.PatternFillType[
                  patternProps.pattern.patternFillType
                ] as PatternFillType
              }
              options={PATTERN_FILL_TYPE_OPTIONS}
              onChange={handleSelectPatternSize}
            />
            <Spacer.Horizontal size={8} />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                contextOpacity !== undefined
                  ? Math.round(contextOpacity * 100)
                  : undefined
              }
              onSetValue={handleSetContextOpacity}
            />
          </>
        );
    }
  }, [
    colorProps.color,
    contextOpacity,
    fillType,
    getGradientTypeTitle,
    gradientProps.gradient.gradientType,
    gradientTypeId,
    handleSelectGradientType,
    handleSelectPatternSize,
    handleSetContextOpacity,
    handleSetOpacity,
    hexInputId,
    opacityInputId,
    patternProps.pattern.patternFillType,
    patternSizeId,
  ]);

  return (
    <InspectorPrimitives.Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <FillInputFieldWithPicker
          id={fillInputId}
          fillType={fillType}
          onChangeType={onChangeFillType}
          colorProps={colorProps}
          gradientProps={gradientProps}
          patternProps={patternProps}
        />
        <Spacer.Horizontal size={8} />
        {fields}
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});
