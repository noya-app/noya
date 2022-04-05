import styled from 'styled-components';
import { memo, useCallback, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';

import Sketch from 'noya-file-format';
import { Selectors } from 'noya-state';
import { useGlobalInputBlurListener } from 'noya-ui';
import { useApplicationState } from 'noya-app-state-context';
import { Layout, FillInputField, Select } from 'noya-designsystem';
import {
  useDialogContainsElement,
  useOpenInputDialog,
} from '../../contexts/DialogContext';
import { Primitives } from '../../primitives';
import ColorInspector from '../../ColorInspector';
import GradientInspector from '../../GradientInspector';
// import PatternInspector from './PatternInspector';
// import PickerGradients from './PickerGradients';
// import PickerPatterns from './PickerPatterns';
import ColorPickerSwatches from '../../ColorPickerSwatches';
// import ShaderInspector from './ShaderInspector';
import {
  FillOption,
  FillInputProps,
  ColorFillProps,
  PatternFillProps,
  GradientFillProps,
  FillOptionSelectProps,
} from './types';

const Content = styled(Popover.Content)<{ variant: 'normal' | 'large' }>(
  ({ theme, variant }) => ({
    width: variant === 'large' ? '680px' : '240px',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: theme.colors.popover.background,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
    maxHeight: '600px',
    overflowY: 'auto',
    color: theme.colors.textMuted,
  }),
);

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
  const openDialog = useOpenInputDialog();

  const gradientAssets = Selectors.getGradientAssets(state);

  const createThemeGradient = useCallback(async () => {
    if (!gradient) return;

    const gradientName = await openDialog('New Gradient Asset Name');

    if (!gradientName) return;

    dispatch('addGradientAsset', gradientName, gradient);
  }, [dispatch, gradient, openDialog]);

  const onRemoveThemeGradient = useCallback(
    (id: string) => dispatch('removeGradientAsset', id),
    [dispatch],
  );

  const onRenameThemeGradient = useCallback(
    (id: string, name: string) => dispatch('setGradientAssetName', id, name),
    [dispatch],
  );
  //     <PickerGradients
  //       gradientAssets={gradientAssets}
  //       onCreate={createThemeGradient}
  //       onChange={onChangeGradient}
  //       onDelete={onRemoveThemeGradient}
  //       onRename={onRenameThemeGradient}
  //     />

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
  // const [state, dispatch] = useApplicationState();

  // const createImage = useCallback(
  //   (data: ArrayBuffer, _ref: string) => {
  //     dispatch('addImage', data, _ref);
  //   },
  //   [dispatch],
  // );

  // return (
  //   <>
  //     <PatternInspector
  //       id={`${id}-pattern-inspector`}
  //       pattern={pattern}
  //       createImage={createImage}
  //       onChangeImage={onChangeFillImage}
  //       onChangeFillType={onChangePatternFillType}
  //       onChangeTileScale={onChangePatternTileScale}
  //     />
  //     <PickerPatterns
  //       imageAssets={Selectors.getImageAssets(state)}
  //       onChange={onChangeFillImage}
  //     />
  //   </>
  // );
  return null;
}

function FillOptionSelect({
  fillType,
  gradientType,
  onChangeType,
  onChangeGradientType,
  supportsGradients,
  supportsPatterns,
  supportsShaders,
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
      ...(supportsShaders ? ['Shader' as const] : []),
    ],
    [supportsGradients, supportsPatterns, supportsShaders],
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
      case Sketch.FillType.Shader:
        return 'Shader';
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
        case 'Shader':
          onChangeType(Sketch.FillType.Shader);
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
      getTitle={useCallback(
        (option) => (option === 'Shader' ? 'Shader (beta)' : option),
        [],
      )}
      onChange={handleChange}
    />
  );
}

export default memo(function FillInputFieldWithPicker({
  id,
  flex,
  fillType,
  onChangeType,
  hasMultipleFills = false,
  colorProps,
  gradientProps,
  patternProps,
  shaderProps,
}: FillInputProps) {
  const dialogContainsElement = useDialogContainsElement();

  const [state, dispatch] = useApplicationState();
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
      case Sketch.FillType.Shader:
        // return shaderProps ? (
        //   <ShaderInspector id={id} {...shaderProps} />
        // ) : null;
        return null;
      case Sketch.FillType.Color:
      case undefined:
        return <ColorFillPicker id={id} {...colorProps} />;
    }
  }, [fillType, gradientProps, id, patternProps, shaderProps, colorProps]);

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

  useGlobalInputBlurListener(() => {
    if (state.selectedGradient) {
      dispatch('setSelectedGradient', undefined);
    }
  });

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open && fillType === Sketch.FillType.Gradient) {
          gradientProps?.onEditGradient(0);
        }

        if (!open) {
          dispatch('setSelectedGradient', undefined);
        }
      }}
    >
      <Popover.Trigger as={Slot}>
        <FillInputField
          id={id}
          flex={flex}
          value={hasMultipleFills ? undefined : value}
        />
      </Popover.Trigger>
      <Content
        // Prevent focus within a dialog from closing the popover
        onFocusOutside={useCallback(
          (event) => {
            if (
              event.target &&
              event.target instanceof HTMLElement &&
              dialogContainsElement(event.target)
            ) {
              event.preventDefault();
            }
          },
          [dialogContainsElement],
        )}
        // Stop propagation on pointer events to prevent dndkit from triggering
        onPointerDown={useCallback((event) => event.stopPropagation(), [])}
        variant={fillType === Sketch.FillType.Shader ? 'large' : 'normal'}
        side="bottom"
        align="center"
        onInteractOutside={useCallback((event) => {
          // We allow interacting with the canvas to support editing gradients.
          // If the inspector re-renders, e.g. due to layer selection change, the
          // popover will close automatically.
          if (
            event.target instanceof HTMLElement &&
            event.target.id === 'canvas-container'
          ) {
            event.preventDefault();
          }
        }, [])}
      >
        {(gradientProps || patternProps) && (
          <>
            <Primitives.Section>
              <Primitives.Row>
                <FillOptionSelect
                  supportsGradients={!!gradientProps}
                  supportsPatterns={!!patternProps}
                  supportsShaders={!!shaderProps}
                  fillType={fillType ?? Sketch.FillType.Color}
                  gradientType={
                    gradientProps?.gradient.gradientType ??
                    Sketch.GradientType.Linear
                  }
                  onChangeType={(type) => {
                    onChangeType?.(type);
                    if (type === Sketch.FillType.Gradient) {
                      gradientProps?.onEditGradient(0);
                    }
                  }}
                  onChangeGradientType={gradientProps?.onChangeGradientType}
                />
              </Primitives.Row>
            </Primitives.Section>
            <Layout.Divider />
          </>
        )}
        {picker}
      </Content>
    </Popover.Root>
  );
});
