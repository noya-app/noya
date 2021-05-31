import React, { useCallback, useEffect, useState } from 'react';
import { useGlobalInputBlurListener } from '../../contexts/GlobalInputBlurContext';

type Props = {
  id?: string;
  style?: any;
  className?: string;
  disabled?: boolean;
  value: string;
  placeholder?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ControlledProps = Props & {
  onChange: (value: string) => void;
};

function ControlledTextInput({
  id,
  style,
  className,
  placeholder,
  disabled,
  onKeyDown,
  value,
  onChange,
}: ControlledProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
    },
    [onKeyDown],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <input
      id={id}
      style={style}
      className={className}
      type="text"
      disabled={disabled ?? false}
      value={value}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
    />
  );
}

type SubmittableProps = Props & {
  onSubmit: (value: string, reset: () => void) => void;
};

function SubmittableTextInput({
  id,
  style,
  className,
  placeholder,
  onKeyDown,
  value,
  disabled,
  onSubmit,
}: SubmittableProps) {
  const [internalValue, setInternalValue] = useState('');

  // Only trigger a submit event on blur if the value changed
  const [initialFocusValue, setInitialFocusValue] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSubmit = useCallback(() => {
    if (initialFocusValue === internalValue) return;

    let didReset = false;

    onSubmit(internalValue, () => {
      didReset = true;
      setInternalValue(value);
    });

    if (!didReset) {
      setInitialFocusValue(internalValue);
    }
  }, [onSubmit, internalValue, initialFocusValue, value]);

  useGlobalInputBlurListener(handleSubmit);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();

        event.preventDefault();
        event.stopPropagation();
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

  const handleFocus = useCallback(() => {
    setInitialFocusValue(internalValue);
  }, [internalValue]);

  return (
    <input
      id={id}
      style={style}
      className={className}
      type="text"
      disabled={disabled ?? false}
      value={internalValue}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleSubmit}
      onFocus={handleFocus}
    />
  );
}

export type TextInputProps = ControlledProps | SubmittableProps;

/**
 * This component shouldn't be used directly. Instead use the InputField components.
 */
export default function TextInput(props: TextInputProps) {
  if ('onChange' in props) {
    return <ControlledTextInput {...props} />;
  } else {
    return <SubmittableTextInput {...props} />;
  }
}
