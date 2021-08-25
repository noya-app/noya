import { composeRefs } from '@radix-ui/react-compose-refs';
import React, {
  ForwardedRef,
  forwardRef,
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
  disabled?: boolean;
  value: string;
  placeholder?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent) => void;
};

type ControlledProps = Props & {
  onChange: (value: string) => void;
};

const ControlledTextInput = forwardRef(function ControlledTextInput(
  {
    id,
    style,
    className,
    placeholder,
    disabled,
    onKeyDown,
    value,
    onChange,
    onClick,
  }: ControlledProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
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
      ref={forwardedRef}
      id={id}
      style={style}
      className={className}
      type="text"
      disabled={disabled ?? false}
      value={value}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onClick={onClick}
    />
  );
});

type SubmittableProps = Props & {
  onSubmit: (value: string) => void;
  allowSubmittingWithSameValue?: boolean;
};

const SubmittableTextInput = forwardRef(function SubmittableTextInput(
  {
    id,
    style,
    className,
    placeholder,
    onKeyDown,
    value,
    disabled,
    onSubmit,
    onClick,
    allowSubmittingWithSameValue = false,
  }: SubmittableProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const ref = React.useRef<HTMLInputElement>(null);

  const latestValue = useRef(value);
  latestValue.current = value;

  const isBlurTriggeredByEscapeKey = useRef(false);

  const [internalValue, setInternalValue] = useState('');

  useLayoutEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSubmit = useCallback(() => {
    // If escape triggered this submission, we want to submit the original value.
    let submitWithOriginalValue = isBlurTriggeredByEscapeKey.current;

    if (isBlurTriggeredByEscapeKey.current) {
      isBlurTriggeredByEscapeKey.current = false;
    }

    if (value === internalValue && !allowSubmittingWithSameValue) return;

    onSubmit(submitWithOriginalValue ? value : internalValue);

    setInternalValue(latestValue.current);
  }, [allowSubmittingWithSameValue, value, internalValue, onSubmit]);

  useGlobalInputBlurListener(handleSubmit);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSubmit();

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Escape') {
        isBlurTriggeredByEscapeKey.current = true;

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
      onClick={onClick}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
});

export type TextInputProps = ControlledProps | SubmittableProps;

/**
 * This component shouldn't be used directly. Instead use the InputField components.
 */
export default forwardRef(function TextInput(
  props: TextInputProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  if ('onChange' in props) {
    return <ControlledTextInput ref={forwardedRef} {...props} />;
  } else {
    return <SubmittableTextInput ref={forwardedRef} {...props} />;
  }
});
