import React, { memo, ReactNode, useCallback, useMemo } from 'react';

import Sketch from 'noya-file-format';
import {
  validHex,
  hexToRgba,
  sketchColorToHex,
  rgbaToSketchColor,
} from 'noya-colorpicker';
import {
  Select,
  InputField,
  LabeledView,
  withSeparatorElements,
} from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { DimensionInput, DimensionValue } from '../DimensionsInspector';
import FillInputFieldWithPicker, {
  ColorFillProps,
  ShaderFillProps,
  PatternFillProps,
  GradientFillProps,
} from './FillInputFieldWithPicker';
import {
  PatternFillType,
  PATTERN_FILL_TYPE_OPTIONS,
} from '../PatternInspector';
import { ShaderVariableValueInput } from '../ShaderVariableRow';
import { Primitives } from '../primitives';

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
  pattern?: Sketch.Pattern;
  contextOpacity: DimensionValue;
  onChangeFillType: (type: Sketch.FillType) => void;
  onSetOpacity: (amount: number, mode: SetNumberMode) => void;
  onSetContextOpacity: (value: number, mode: SetNumberMode) => void;
  colorProps: ColorFillProps;
  gradientProps: GradientFillProps;
  patternProps: PatternFillProps;
  shaderProps: ShaderFillProps;
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
  shaderProps,
}: Props) {
  const fillLabel = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Color:
        return 'Color';
      case Sketch.FillType.Gradient:
        return 'Gradient';
      case Sketch.FillType.Pattern:
        return 'Image';
      case Sketch.FillType.Shader:
        return 'Shader';
    }
  }, [fillType]);

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
            <LabeledView label="Hex" flex={1}>
              <InputField.Root labelPosition="start">
                <InputField.Input
                  value={
                    colorProps.color
                      ? sketchColorToHex(colorProps.color).replace('#', '')
                      : ''
                  }
                  placeholder={colorProps.color ? undefined : 'multiple'}
                  onSubmit={(newColor: string) => {
                    if (validHex(newColor)) {
                      colorProps.onChangeColor(
                        rgbaToSketchColor(
                          hexToRgba(newColor, colorProps.color?.alpha),
                        ),
                      );
                    }
                  }}
                />
                <InputField.Label>#</InputField.Label>
              </InputField.Root>
            </LabeledView>
            <Primitives.HorizontalSeparator />
            <LabeledView label="Opacity" size={50}>
              <DimensionInput
                label="%"
                value={
                  colorProps.color?.alpha
                    ? Math.round(colorProps.color.alpha * 100)
                    : undefined
                }
                onSetValue={handleSetOpacity}
              />
            </LabeledView>
          </>
        );
      case Sketch.FillType.Gradient:
        return (
          <>
            <LabeledView label="Type" flex={1}>
              <Select
                value={gradientProps.gradient.gradientType.toString()}
                options={GRADIENT_TYPE_OPTIONS}
                getTitle={getGradientTypeTitle}
                onChange={handleSelectGradientType}
              />
            </LabeledView>
            <Primitives.HorizontalSeparator />
            <LabeledView label="Opacity" size={50}>
              <DimensionInput
                label="%"
                value={
                  contextOpacity !== undefined
                    ? Math.round(contextOpacity * 100)
                    : undefined
                }
                onSetValue={handleSetContextOpacity}
              />
            </LabeledView>
          </>
        );
      case Sketch.FillType.Pattern:
        return (
          <>
            <LabeledView label="Size" flex={1}>
              <Select
                flex={1}
                value={
                  Sketch.PatternFillType[
                    patternProps.pattern.patternFillType
                  ] as PatternFillType
                }
                options={PATTERN_FILL_TYPE_OPTIONS}
                onChange={handleSelectPatternSize}
              />
            </LabeledView>
            <Primitives.HorizontalSeparator />
            <LabeledView label="Opacity" size={50}>
              <DimensionInput
                label="%"
                value={
                  contextOpacity !== undefined
                    ? Math.round(contextOpacity * 100)
                    : undefined
                }
                onSetValue={handleSetContextOpacity}
              />
            </LabeledView>
          </>
        );
      case Sketch.FillType.Shader:
        return withSeparatorElements(
          shaderProps.shader.variables
            .map((variable, index) => (
              <LabeledView
                label={variable.name}
                flex={1}
                key={`${variable.name}-${index}`}
              >
                <ShaderVariableValueInput
                  value={variable.value}
                  onChange={(value) =>
                    shaderProps.onChangeShaderVariableValue(
                      variable.name,
                      value,
                    )
                  }
                  onNudge={(value) =>
                    shaderProps.onNudgeShaderVariableValue(variable.name, value)
                  }
                />
              </LabeledView>
            ))
            .reverse()
            .slice(0, 3),
          <Primitives.HorizontalSeparator />,
        );
    }
  }, [
    colorProps,
    contextOpacity,
    fillType,
    getGradientTypeTitle,
    gradientProps.gradient.gradientType,
    handleSelectGradientType,
    handleSelectPatternSize,
    handleSetContextOpacity,
    handleSetOpacity,
    patternProps.pattern.patternFillType,
    shaderProps,
  ]);

  return (
    <Primitives.Row id={id}>
      <Primitives.DragHandle />
      <LabeledView>{prefix}</LabeledView>
      {prefix && <Primitives.HorizontalSeparator />}
      <LabeledView label={fillLabel}>
        <FillInputFieldWithPicker
          fillType={fillType}
          onChangeType={onChangeFillType}
          colorProps={colorProps}
          gradientProps={gradientProps}
          patternProps={patternProps}
          shaderProps={shaderProps}
        />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      {fields}
    </Primitives.Row>
  );
});
