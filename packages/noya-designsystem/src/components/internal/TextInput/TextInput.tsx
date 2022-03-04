import React, {
  useRef,
  useState,
  forwardRef,
  useCallback,
  ForwardedRef,
  useLayoutEffect,
} from 'react';
import { useGlobalInputBlurListener } from 'noya-ui';
import { composeRefs } from '@radix-ui/react-compose-refs';

import { ControlledProps, SubmittableProps, TextInputProps } from './types';

const ControlledTextInput = forwardRef(function ControlledTextInput(
  { onKeyDown, value, onChange, ...rest }: ControlledProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={forwardedRef}
      {...rest}
      value={value}
      onKeyDown={onKeyDown}
      onChange={useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value),
        [onChange],
      )}
    />
  );
});

const SubmittableTextInput = forwardRef(function SubmittableTextInput(
  {
    onKeyDown,
    value,
    onSubmit,
    allowSubmittingWithSameValue = false,
    ...rest
  }: SubmittableProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const ref = React.useRef<HTMLInputElement>(null);

  const latestValue = useRef(value);
  latestValue.current = value;

  const isSubmitTriggeredByEscapeKey = useRef(false);

  const [internalValue, setInternalValue] = useState('');

  useLayoutEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSubmit = useCallback(() => {
    // If this submission was triggered with Escape, we attempt to submit the original value.
    // This will only actually call `onSubmit` if `allowSubmittingWithSameValue` is also true.
    const submissionValue = isSubmitTriggeredByEscapeKey.current
      ? value
      : internalValue;

    isSubmitTriggeredByEscapeKey.current = false;

    if (submissionValue === value && !allowSubmittingWithSameValue) return;

    onSubmit(submissionValue);

    setInternalValue(latestValue.current);
  }, [allowSubmittingWithSameValue, value, internalValue, onSubmit]);

  useGlobalInputBlurListener(
    useCallback(() => {
      if (ref.current !== document.activeElement) return;

      handleSubmit();
    }, [handleSubmit]),
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Escape') {
        isSubmitTriggeredByEscapeKey.current = true;

        ref.current?.blur();
      } else {
        onKeyDown?.(event);
      }
    },
    [onKeyDown, handleSubmit],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(event.target.value);
    },
    [],
  );

  return (
    <input
      ref={composeRefs(ref, forwardedRef)}
      {...rest}
      value={internalValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleSubmit}
    />
  );
});

/**
 * This component shouldn't be used directly. Instead use the InputField components.
 */
export default forwardRef(function TextInput(
  props: TextInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const commonProps: TextInputProps = {
    onPointerDown: useCallback((event) => event.stopPropagation(), []),
    onClick: useCallback((event) => event.stopPropagation(), []),
    autoComplete: 'off',
    autoCapitalize: 'off',
    autoCorrect: 'off',
    spellCheck: false,
    type: 'text',
    disabled: false,
    ...props,
  };

  if ('onChange' in commonProps) {
    return <ControlledTextInput ref={forwardedRef} {...commonProps} />;
  } else {
    return <SubmittableTextInput ref={forwardedRef} {...commonProps} />;
  }
});
