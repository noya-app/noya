import React, {
  useRef,
  useState,
  forwardRef,
  useCallback,
  ForwardedRef,
  useLayoutEffect,
} from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
} from 'react-native';
import { ControlledProps, SubmittableProps, TextInputProps } from './types';

const ControlledTextInput = forwardRef(function ControlledTextInput(
  {
    value,
    onChange,
    onKeyDown,
    spellCheck,
    autoCorrect,
    autoComplete,
    autoCapitalize,
    ...rest
  }: ControlledProps,
  forwardedRef: ForwardedRef<TextInput>,
) {
  const onKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      // TODO: add some lib to handle shift & alt modifiers?
      onKeyDown?.({
        key: e.nativeEvent.key,
        shiftKey: false,
        altKey: false,
        stopPropagation: () => {},
        preventDefault: () => {},
      });
    },
    [onKeyDown],
  );

  return (
    <TextInput
      ref={forwardedRef}
      value={value}
      onKeyPress={onKeyDown ? onKeyPress : undefined}
      autoCorrect={autoCorrect !== 'off'}
      autoComplete={autoComplete}
      spellCheck={
        typeof spellCheck === 'string' ? spellCheck === 'true' : spellCheck
      }
      autoCapitalize={
        autoCapitalize === 'off'
          ? 'none'
          : (autoCapitalize as 'sentences' | 'words' | 'characters')
      }
      onChangeText={onChange}
      {...rest}
    />
  );
});

const SubmittableTextInput = forwardRef(function SubmittableTextInput(
  {
    value,
    onSubmit,
    onKeyDown,
    spellCheck,
    autoCorrect,
    autoComplete,
    autoCapitalize,
    allowSubmittingWithSameValue = false,
    ...rest
  }: SubmittableProps,
  forwardedRef: ForwardedRef<TextInput>,
) {
  const [internalValue, setInternalValue] = useState('');
  const latestValue = useRef(value);
  latestValue.current = value;

  useLayoutEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleEditFinish = useCallback(
    (isTriggeredByBlur: boolean) => {
      const submissionValue = isTriggeredByBlur ? value : internalValue;

      if (submissionValue === value && !allowSubmittingWithSameValue) {
        return;
      }

      onSubmit(submissionValue);
      setInternalValue(latestValue.current);
    },
    [value, internalValue, allowSubmittingWithSameValue, onSubmit],
  );

  const handleSubmit = useCallback(() => {
    handleEditFinish(false);
  }, [handleEditFinish]);

  const handleBlur = useCallback(() => {
    handleEditFinish(true);
  }, [handleEditFinish]);

  // const handleKeyDown = useCallback(
  //   (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
  //     // TODO
  //   },
  //   [],
  // );

  const handleChange = useCallback((value: string) => {
    setInternalValue(value);
  }, []);

  return (
    <TextInput
      ref={forwardedRef}
      {...rest}
      value={internalValue}
      onChangeText={handleChange}
      onSubmitEditing={handleSubmit}
      onBlur={handleBlur}
      autoCorrect={autoCorrect !== 'off'}
      autoComplete={autoComplete}
      spellCheck={
        typeof spellCheck === 'string' ? spellCheck === 'true' : spellCheck
      }
      autoCapitalize={
        autoCapitalize === 'off'
          ? 'none'
          : (autoCapitalize as 'sentences' | 'words' | 'characters')
      }
    />
  );
});

/**
 * This component shouldn't be used directly. Instead use the InputField components.
 */
export default forwardRef(function TextInput(
  props: TextInputProps,
  forwardedRef: ForwardedRef<TextInput>,
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
  }

  return <SubmittableTextInput ref={forwardedRef} {...commonProps} />;
});
