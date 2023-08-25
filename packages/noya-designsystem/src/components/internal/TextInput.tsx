import { composeRefs } from '@radix-ui/react-compose-refs';
import React, {
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useGlobalInputBlurListener } from '../../contexts/GlobalInputBlurContext';

type Props = {
  id?: string;
  style?: any;
  className?: string;
  type?: 'text' | 'search';
  disabled?: boolean;
  value: string;
  placeholder?: string;
  onKeyDown?: KeyboardEventHandler;
  onClick?: MouseEventHandler;
  onDoubleClick?: MouseEventHandler;
  onPointerDown?: PointerEventHandler;
  onFocusCapture?: FocusEventHandler;
  onFocusChange?: (isFocused: boolean) => void;
  onBlur?: FocusEventHandler;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'autoComplete' | 'autoCapitalize' | 'autoCorrect' | 'spellCheck'
>;

type ReadOnlyProps = Props & {
  readOnly: true;
};

const ReadOnlyTextInput = forwardRef(function ReadOnlyTextInput(
  { onKeyDown, value, ...rest }: ReadOnlyProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={forwardedRef}
      {...rest}
      value={value}
      onKeyDown={onKeyDown}
      readOnly
    />
  );
});

type ControlledProps = Props & {
  onChange: (value: string) => void;
};

const ControlledTextInput = forwardRef(function ControlledTextInput(
  {
    onKeyDown,
    value,
    onChange,
    onFocusChange,
    onBlur,
    onFocusCapture,
    ...rest
  }: ControlledProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);

      onFocusChange?.(false);
    },
    [onBlur, onFocusChange],
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocusCapture?.(event);

      onFocusChange?.(true);
    },
    [onFocusCapture, onFocusChange],
  );

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
      onBlur={handleBlur}
      onFocusCapture={handleFocusCapture}
    />
  );
});

type SubmittableProps = Props & {
  onSubmit: (value: string) => void;
  allowSubmittingWithSameValue?: boolean;
};

const SubmittableTextInput = forwardRef(function SubmittableTextInput(
  {
    onKeyDown,
    value,
    onSubmit,
    onBlur,
    onFocusChange,
    onFocusCapture,
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

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);

      onFocusChange?.(false);

      handleSubmit();
    },
    [onBlur, onFocusChange, handleSubmit],
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocusCapture?.(event);

      onFocusChange?.(true);
    },
    [onFocusCapture, onFocusChange],
  );

  return (
    <input
      ref={composeRefs(ref, forwardedRef)}
      {...rest}
      value={internalValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocusCapture={handleFocusCapture}
    />
  );
});

export type TextInputProps = ReadOnlyProps | ControlledProps | SubmittableProps;

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

  if ('readOnly' in commonProps) {
    return <ReadOnlyTextInput ref={forwardedRef} {...commonProps} readOnly />;
  } else if ('onChange' in commonProps) {
    return <ControlledTextInput ref={forwardedRef} {...commonProps} />;
  } else {
    return <SubmittableTextInput ref={forwardedRef} {...commonProps} />;
  }
});
