import { InputField, Stack, useDesignSystemTheme } from 'noya-designsystem';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BreadcrumbLink, BreadcrumbText } from './Breadcrumbs';

interface Props {
  value: string;
  placeholder?: string;
  href?: string;
  onChange: (value: string) => void;
}

export interface IEditableText {
  startEditing: () => void;
}

export const EditableText = memo(
  forwardRef(function EditableText(
    { value, placeholder, onChange, href }: Props,
    ref: React.ForwardedRef<IEditableText>,
  ) {
    const theme = useDesignSystemTheme();
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter and Esc both blur the input
        if (event.key === 'Enter' || event.key === 'Escape') {
          inputRef.current?.blur();
        }
      },
      [],
    );

    useImperativeHandle(ref, () => ({
      startEditing: () => {
        setFocused(true);
      },
    }));

    useEffect(() => {
      if (focused) {
        // Focus the input after the next render. The input isn't available
        // even though `focused` was already set to true.
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
        }, 0);
      }
    }, [focused]);

    const displayValue = value || placeholder;

    return (
      <Stack.H position="relative">
        {href ? (
          <BreadcrumbLink href={href}>{displayValue}</BreadcrumbLink>
        ) : (
          <BreadcrumbText>{displayValue}</BreadcrumbText>
        )}
        {focused && (
          <Stack.H position="absolute" inset="0">
            <InputField.Root onFocusChange={setFocused}>
              <InputField.Input
                ref={inputRef}
                variant="bare"
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                style={{
                  ...theme.textStyles.small,
                  lineHeight: '15px', // Match breadcrumb height
                }}
              />
            </InputField.Root>
          </Stack.H>
        )}
      </Stack.H>
    );
  }),
);
