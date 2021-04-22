import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import styled from 'styled-components';
import handleNudge from '../utils/handleNudge';
import TextInput, { TextInputProps } from './internal/TextInput';

type LabelPosition = 'start' | 'end';

const InputFieldContext = createContext<{
  labelPosition: LabelPosition;
  labelSize: number;
}>({
  labelPosition: 'end',
  labelSize: 6,
});

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.label<{ labelPosition: LabelPosition }>(
  ({ theme, labelPosition }) => ({
    color: theme.colors.textMuted,
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
    userSelect: 'none',
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

const InputElement = styled(TextInput)<{
  labelPosition: LabelPosition;
  labelSize: number;
}>(({ theme, labelPosition, labelSize }) => ({
  ...theme.textStyles.small,
  color: theme.colors.text,
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
  paddingLeft: labelPosition === 'start' ? `${6 + labelSize + 6}px` : '6px',
  paddingRight: labelPosition === 'start' ? '6px' : `${6 + labelSize + 6}px`,
  background: theme.colors.inputBackground,
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

function InputFieldInput(props: TextInputProps) {
  const { labelPosition, labelSize } = useContext(InputFieldContext);

  return (
    <InputElement
      labelPosition={labelPosition}
      labelSize={labelSize}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------------------
 * NumberInput
 * ------------------------------------------------------------------------- */

type InputFieldNumberInputProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onKeyDown' | 'onSubmit'
> & {
  value: number | undefined;
  onNudge?: (value: number) => void;
} & (
    | {
        onChange: (value: number) => void;
      }
    | {
        onSubmit: (value: number, reset: () => void) => void;
      }
  );

function parseNumber(value: string) {
  return value ? Number(value) : NaN;
}

function InputFieldNumberInput(props: InputFieldNumberInputProps) {
  const { value, placeholder, onNudge } = props;
  const onSubmit = 'onSubmit' in props ? props.onSubmit : undefined;
  const onChange = 'onChange' in props ? props.onChange : undefined;

  const handleSubmit = useCallback(
    (value: string, reset: () => void) => {
      const newValue = parseNumber(value);

      if (isNaN(newValue)) {
        reset();
      } else {
        onSubmit?.(newValue, reset);
      }
    },
    [onSubmit],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const amount = handleNudge(event);

      if (!amount) return;

      onNudge?.(amount);

      event.preventDefault();
      event.stopPropagation();
    },
    [onNudge],
  );

  const handleChange = useCallback(
    (value: string) => {
      onChange?.(parseNumber(value));
    },
    [onChange],
  );

  return (
    <InputFieldInput
      {...props}
      value={value === undefined ? '' : String(value)}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      {...('onChange' in props
        ? { onChange: handleChange }
        : { onSubmit: handleSubmit })}
    />
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
  id?: string;
  children?: ReactNode;
  size?: number;
  labelPosition?: LabelPosition;
  labelSize?: number;
}

function InputFieldRoot({
  id,
  children,
  size,
  labelPosition = 'end',
  labelSize = 6,
}: InputFieldRootProps) {
  const contextValue = useMemo(() => ({ labelPosition, labelSize }), [
    labelPosition,
    labelSize,
  ]);

  return (
    <InputFieldContext.Provider value={contextValue}>
      <RootContainer id={id} size={size}>
        {children}
      </RootContainer>
    </InputFieldContext.Provider>
  );
}

export const Input = memo(InputFieldInput);
export const NumberInput = memo(InputFieldNumberInput);
export const Label = memo(InputFieldLabel);
export const Root = memo(InputFieldRoot);
