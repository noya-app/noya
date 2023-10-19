import React, { memo, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

export const DescriptionTextArea = styled.textarea(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.text,
  background: theme.colors.inputBackground,
  width: '0px',
  flex: '1 1 0px',
  padding: '4px 6px',
  border: 'none',
  outline: 'none',
  height: 100,
  borderRadius: '4px',
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
  // readonly
  '&:read-only': {
    color: theme.colors.textDisabled,
  },
  resize: 'none',
}));

export const useAutoResize = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto'; // Reset the height
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  return textareaRef;
};

export const AutoResizingTextArea = memo(function AutoResizingTextArea({
  value,
  onChangeText,
  ...rest
}: Omit<React.ComponentProps<typeof DescriptionTextArea>, 'onChange'> & {
  onChangeText: (value: string) => void;
}) {
  const textareaRef = useAutoResize(value);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChangeText(event.target.value),
    [onChangeText],
  );

  return (
    <DescriptionTextArea
      ref={textareaRef}
      {...rest}
      onChange={handleChange}
      value={value}
    />
  );
});
