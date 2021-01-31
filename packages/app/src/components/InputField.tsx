import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import styled from 'styled-components';

type LabelPosition = 'start' | 'end';

const InputFieldContext = createContext<{ labelPosition: LabelPosition }>({
  labelPosition: 'end',
});

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.label<{ labelPosition: LabelPosition }>(
  ({ labelPosition }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    fontWeight: 'bold',
    fontSize: '60%',
    opacity: 0.5,
    ...(labelPosition === 'start'
      ? { justifyContent: 'flex-start', paddingLeft: '6px' }
      : { justifyContent: 'flex-end', paddingRight: '6px' }),
  }),
);

interface InputFieldLabelProps {
  children?: ReactNode;
}

function InputFieldLabel({ children = false }: InputFieldLabelProps) {
  const { labelPosition } = useContext(InputFieldContext);

  return (
    <LabelContainer labelPosition={labelPosition}>{children}</LabelContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Input
 * ------------------------------------------------------------------------- */

const InputElement = styled.input<{ labelPosition: LabelPosition }>(
  ({ theme, labelPosition }) => ({
    ...theme.textStyles.small,
    width: '0px', // Reset intrinsic width
    flex: '1 1 0px',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: 'left',
    alignSelf: 'stretch',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: labelPosition === 'start' ? '18px' : '6px',
    paddingRight: labelPosition === 'start' ? '6px' : '18px',
    background: theme.colors.inputBackground,
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
  }),
);

interface InputFieldInputProps {
  value: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}

function InputFieldInput({ value, children, onChange }: InputFieldInputProps) {
  const { labelPosition } = useContext(InputFieldContext);

  return (
    <InputElement
      labelPosition={labelPosition}
      value={value}
      onChange={useCallback(
        (event) => {
          onChange?.(event.target.value);
        },
        [onChange],
      )}
    >
      {children}
    </InputElement>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.div<{ size?: number }>(({ theme, size }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  maxWidth: typeof size === 'number' ? `${size}px` : undefined,
}));

interface InputFieldRootProps {
  children?: ReactNode;
  size?: number;
  labelPosition?: LabelPosition;
}

function InputFieldRoot({
  children,
  size,
  labelPosition = 'end',
}: InputFieldRootProps) {
  const contextValue = useMemo(() => ({ labelPosition }), [labelPosition]);

  return (
    <InputFieldContext.Provider value={contextValue}>
      <RootContainer size={size}>{children}</RootContainer>
    </InputFieldContext.Provider>
  );
}

export const Input = memo(InputFieldInput);
export const Label = memo(InputFieldLabel);
export const Root = memo(InputFieldRoot);
