import styled from 'styled-components';
import { memo, useCallback, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';

import Sketch from 'noya-file-format';
import { useGlobalInputBlurListener } from 'noya-ui';
import { useApplicationState } from 'noya-app-state-context';
import { Layout, FillInputField } from 'noya-designsystem';
import { useDialogContainsElement } from '../../contexts/DialogContext';
import { Primitives } from '../../primitives';
// import PatternInspector from './PatternInspector';
// import PickerGradients from './PickerGradients';
// import PickerPatterns from './PickerPatterns';
// import ShaderInspector from './ShaderInspector';
import type { FillInputProps } from './types';
import ColorFillPicker from './ColorFillPicker';
import FillOptionSelect from './FillOptionSelect';
import PatternFillPicker from './PatternFillPicker';
import GradientFillPicker from './GradientFillPicker';

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
