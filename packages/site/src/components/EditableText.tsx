import { InputField, Stack, Text, useHover } from 'noya-designsystem';
import React, { memo, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div(({ theme }) => ({
  position: 'relative',

  '&:hover': {
    cursor: 'text',
    background: theme.colors.inputBackground,
  },
}));

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export const EditableText = memo(function EditableText({
  value,
  placeholder,
  onChange,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { hoverProps } = useHover({ onHoverChange: setHovered });
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

  return (
    <Container style={style} {...hoverProps}>
      <Text variant="small" whiteSpace="pre">
        {value || placeholder}
      </Text>
      {(hovered || focused) && (
        <Stack.H position="absolute" inset="0px">
          <InputField.Root onFocusChange={setFocused}>
            <InputField.Input
              ref={inputRef}
              variant="bare"
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onKeyDown={handleKeyDown}
            />
          </InputField.Root>
        </Stack.H>
      )}
    </Container>
  );
});
