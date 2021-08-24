import { CaretDownIcon } from '@radix-ui/react-icons';
import {
  Children,
  createContext,
  ForwardedRef,
  forwardRef,
  isValidElement,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { Property } from 'csstype';
import styled from 'styled-components';
import handleNudge from '../utils/handleNudge';
import TextInput, { TextInputProps } from './internal/TextInput';
import { DropdownMenu as NoyaDropdownMenu, MenuItem } from 'noya-designsystem';
import Button from './Button';

type LabelPosition = 'start' | 'end';

const InputFieldContext = createContext<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
}>({
  labelPosition: 'end',
  labelSize: 6,
  hasLabel: false,
  hasDropdown: false,
});

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.label<{
  labelPosition: LabelPosition;
  hasDropdown: boolean;
}>(({ theme, labelPosition, hasDropdown }) => ({
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
    : {
        justifyContent: 'flex-end',
        paddingRight: hasDropdown ? '16px' : '6px',
      }),
}));

interface InputFieldLabelProps {
  children?: ReactNode;
}

function InputFieldLabel({ children = false }: InputFieldLabelProps) {
  const { labelPosition, hasDropdown } = useContext(InputFieldContext);

  return (
    <LabelContainer labelPosition={labelPosition} hasDropdown={hasDropdown}>
      {children}
    </LabelContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Dropdown
 * ------------------------------------------------------------------------- */

const DropdownContainer = styled.span(({ theme }) => ({
  position: 'absolute',
  right: 0,
}));

interface InputFieldDropdownProps<T extends string> {
  id: string;
  items: MenuItem<T>[];
  onSelect: (value: T) => void;
}

function InputFieldDropdownMenu<T extends string>({
  id,
  items,
  onSelect,
}: InputFieldDropdownProps<T>) {
  return (
    <DropdownContainer>
      <NoyaDropdownMenu<T> items={items} onSelect={onSelect}>
        <Button id={id} variant="thin">
          <CaretDownIcon />
        </Button>
      </NoyaDropdownMenu>
    </DropdownContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Input
 * ------------------------------------------------------------------------- */

type InputFieldVariant = 'normal' | 'bare';

export const InputElement = styled(TextInput)<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
  textAlign?: Property.TextAlign;
  disabled?: boolean;
  variant?: InputFieldVariant;
}>(
  ({
    theme,
    labelPosition,
    labelSize,
    hasDropdown,
    textAlign,
    disabled,
    hasLabel,
    variant = 'normal',
  }) => ({
    ...theme.textStyles.small,
    color: disabled ? theme.colors.textDisabled : theme.colors.text,
    width: '0px', // Reset intrinsic width
    flex: '1 1 0px',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: textAlign ?? 'left',
    alignSelf: 'stretch',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft:
      6 + (hasLabel && labelPosition === 'start' ? 6 + labelSize : 0) + 'px',
    paddingRight:
      6 +
      (hasLabel && labelPosition === 'end' ? 6 + labelSize : 0) +
      (hasDropdown ? 11 : 0) +
      'px',
    background: theme.colors.inputBackground,
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
    ...(variant === 'bare' && {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    }),
  }),
);

const InputFieldInput = forwardRef(function InputFieldInput(
  props: TextInputProps & { textAlign?: Property.TextAlign; variant?: 'bare' },
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const { labelPosition, labelSize, hasDropdown, hasLabel } =
    useContext(InputFieldContext);

  return (
    <InputElement
      ref={forwardedRef}
      labelPosition={labelPosition}
      labelSize={labelSize}
      hasLabel={hasLabel}
      hasDropdown={hasDropdown}
      {...props}
    />
  );
});

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

const RootContainer = styled.div<{ size?: number; flex?: string }>(
  ({ theme, flex, size }) => ({
    flex: flex ?? '1',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    maxWidth: typeof size === 'number' ? `${size}px` : undefined,
  }),
);

interface InputFieldRootProps {
  id?: string;
  flex?: string;
  children?: ReactNode;
  size?: number;
  labelPosition?: LabelPosition;
  labelSize?: number;
  hasDropdown?: boolean;
}

function InputFieldRoot({
  id,
  flex,
  children,
  size,
  labelPosition = 'end',
  labelSize = 6,
}: InputFieldRootProps) {
  const childrenArray = Children.toArray(children);

  const hasDropdown = childrenArray.some(
    (child) => isValidElement(child) && child.type === DropdownMenu,
  );
  const hasLabel = childrenArray.some(
    (child) => isValidElement(child) && child.type === Label,
  );

  const contextValue = useMemo(
    () => ({ labelPosition, labelSize, hasDropdown, hasLabel }),
    [labelPosition, labelSize, hasDropdown, hasLabel],
  );

  return (
    <InputFieldContext.Provider value={contextValue}>
      <RootContainer id={id} size={size} flex={flex}>
        {children}
      </RootContainer>
    </InputFieldContext.Provider>
  );
}

export const Input = memo(InputFieldInput);
export const NumberInput = memo(InputFieldNumberInput);
export const Label = memo(InputFieldLabel);
export const DropdownMenu = memo(InputFieldDropdownMenu);
export const Root = memo(InputFieldRoot);
