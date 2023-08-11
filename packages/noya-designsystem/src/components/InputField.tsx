import { Property } from 'csstype';
import { CaretDownIcon } from 'noya-icons';
import { memoize } from 'noya-utils';
import React, {
  Children,
  createContext,
  ForwardedRef,
  forwardRef,
  isValidElement,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import styled from 'styled-components';
import handleNudge from '../utils/handleNudge';
import { Button } from './Button';
import { DropdownMenu } from './DropdownMenu';
import { MenuItem } from './internal/Menu';
import TextInput, { TextInputProps } from './internal/TextInput';
import { Popover } from './Popover';
import { Stack } from './Stack';

type LabelPosition = 'start' | 'end';

export type InputFieldSize = 'small' | 'medium' | 'large';

type InputFieldContextValue = {
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
  size: InputFieldSize;
  isFocused: boolean;
  onFocusChange: (isFocused: boolean) => void;
  inputRef?: ForwardedRef<HTMLInputElement>;
  setInputRef?: (ref: ForwardedRef<HTMLInputElement>) => void;
};

const InputFieldContext = createContext<InputFieldContextValue>({
  labelPosition: 'end',
  labelSize: 6,
  hasLabel: false,
  hasDropdown: false,
  size: 'medium',
  isFocused: false,
  onFocusChange: () => {},
});

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.label<{
  pointerEvents: Property.PointerEvents;
  labelPosition: LabelPosition;
  hasDropdown: boolean;
}>(({ theme, labelPosition, hasDropdown, pointerEvents }) => ({
  color: theme.colors.textMuted,
  position: 'absolute',
  top: 0,
  right: labelPosition === 'end' ? 0 : undefined,
  bottom: 0,
  left: labelPosition === 'start' ? 0 : undefined,
  display: 'flex',
  alignItems: 'center',
  pointerEvents,
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
  pointerEvents?: Property.PointerEvents;
}

const InputFieldLabel = memo(function InputFieldLabel({
  children = false,
  pointerEvents = 'none',
}: InputFieldLabelProps) {
  const { labelPosition, hasDropdown } = useContext(InputFieldContext);

  return (
    <LabelContainer
      pointerEvents={pointerEvents}
      labelPosition={labelPosition}
      hasDropdown={hasDropdown}
    >
      {children}
    </LabelContainer>
  );
});

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

const InputFieldDropdownMenu = memo(function InputFieldDropdownMenu<
  T extends string,
>({ id, items, onSelect }: InputFieldDropdownProps<T>) {
  return (
    <DropdownContainer>
      <DropdownMenu<T> items={items} onSelect={onSelect}>
        <Button id={id} variant="thin">
          <CaretDownIcon />
        </Button>
      </DropdownMenu>
    </DropdownContainer>
  );
});

/* ----------------------------------------------------------------------------
 * Button
 * ------------------------------------------------------------------------- */

const ButtonContainer = styled.span<{ size: InputFieldSize }>(
  ({ theme, size }) => ({
    position: 'absolute',
    right: size === 'large' ? '9px' : '2px',
    top: size === 'large' ? '8px' : '2px',
  }),
);

const InputFieldButton = memo(function InputFieldButton({
  children,
  onClick,
}: {
  children?: ReactNode;
  onClick?: () => void;
}) {
  const { size, inputRef } = useContext(InputFieldContext);

  const defaultHandleClick = useCallback(
    (event: React.MouseEvent) => {
      if (inputRef && typeof inputRef !== 'function') {
        inputRef.current?.focus();
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [inputRef],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <ButtonContainer size={size}>
      <Button
        variant="floating"
        onClick={onClick ?? defaultHandleClick}
        onPointerDown={handlePointerDown}
        tabIndex={-1}
      >
        {children}
      </Button>
    </ButtonContainer>
  );
});

/* ----------------------------------------------------------------------------
 * Input
 * ------------------------------------------------------------------------- */

const createCrossSVGString = memoize(
  (color: string) =>
    `<svg width='15' height='15' viewBox='0 0 15 15' fill='${color}' xmlns='http://www.w3.org/2000/svg'>
      <path d='M0.877075 7.49988C0.877075 3.84219 3.84222 0.877045 7.49991 0.877045C11.1576 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49991 1.82704C4.36689 1.82704 1.82708 4.36686 1.82708 7.49988C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988C13.1727 4.36686 10.6329 1.82704 7.49991 1.82704ZM9.85358 5.14644C10.0488 5.3417 10.0488 5.65829 9.85358 5.85355L8.20713 7.49999L9.85358 9.14644C10.0488 9.3417 10.0488 9.65829 9.85358 9.85355C9.65832 10.0488 9.34173 10.0488 9.14647 9.85355L7.50002 8.2071L5.85358 9.85355C5.65832 10.0488 5.34173 10.0488 5.14647 9.85355C4.95121 9.65829 4.95121 9.3417 5.14647 9.14644L6.79292 7.49999L5.14647 5.85355C4.95121 5.65829 4.95121 5.3417 5.14647 5.14644C5.34173 4.95118 5.65832 4.95118 5.85358 5.14644L7.50002 6.79289L9.14647 5.14644C9.34173 4.95118 9.65832 4.95118 9.85358 5.14644Z' fill-rule='evenodd' clip-rule='evenodd'></path>
    </svg>`,
);

type InputFieldVariant = 'normal' | 'bare';

const ignoredProps = new Set([
  'labelPosition',
  'labelSize',
  'hasLabel',
  'hasDropdown',
  'textAlign',
  'variant',
  'onNudge',
]);

export const InputElement = styled(TextInput).withConfig({
  shouldForwardProp: (prop) => (ignoredProps.has(prop) ? false : true),
})<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
  textAlign?: Property.TextAlign;
  disabled?: boolean;
  variant?: InputFieldVariant;
  readOnly?: boolean;
  size: InputFieldSize;
}>(
  ({
    theme,
    labelPosition,
    labelSize,
    hasDropdown,
    textAlign,
    disabled,
    hasLabel,
    readOnly,
    variant = 'normal',
    size,
  }) => ({
    // placeholder
    '&::placeholder': {
      color: theme.colors.textDisabled,
    },
    ...theme.textStyles.small,
    color: readOnly
      ? theme.colors.textMuted
      : disabled
      ? theme.colors.textDisabled
      : theme.colors.text,
    width: '0px', // Reset intrinsic width
    flex: '1 1 0px',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: textAlign ?? 'left',
    alignSelf: 'stretch',
    borderRadius: '4px',
    paddingTop: size === 'large' ? '10px' : '4px',
    paddingBottom: size === 'large' ? '10px' : '4px',
    paddingLeft:
      (size === 'large' ? 10 : 6) +
      (hasLabel && labelPosition === 'start' ? 6 + labelSize : 0) +
      'px',
    paddingRight:
      (size === 'large' ? 10 : 6) +
      (hasLabel && labelPosition === 'end' ? 6 + labelSize : 0) +
      (hasDropdown ? 11 : 0) +
      'px',
    background: theme.colors.inputBackground,
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
    ...(variant === 'bare' && {
      paddingTop: '4px',
      paddingRight: '4px',
      paddingBottom: '4px',
      paddingLeft: '4px',
      marginTop: '-4px',
      marginRight: '-4px',
      marginBottom: '-4px',
      marginLeft: '-4px',
    }),

    '&[type="search"]::-webkit-search-cancel-button': {
      appearance: 'none',
      height: '15px',
      width: '15px',
      background: `url("data:image/svg+xml;utf8,${createCrossSVGString(
        theme.colors.icon,
      )}") no-repeat`,
    },
  }),
);

const InputFieldInput = forwardRef(function InputFieldInput(
  // onFocusChange should only be passed from the root, never directly
  props: TextInputProps & {
    textAlign?: Property.TextAlign;
    variant?: 'bare';
  },
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const {
    labelPosition,
    labelSize,
    hasDropdown,
    hasLabel,
    size,
    onFocusChange,
    setInputRef,
  } = useContext(InputFieldContext);

  const handleFocusChange = useCallback(
    (isFocused: boolean) => {
      onFocusChange(isFocused);
    },
    [onFocusChange],
  );

  useLayoutEffect(() => {
    setInputRef?.(forwardedRef);
  }, [forwardedRef, setInputRef]);

  return (
    <InputElement
      ref={forwardedRef}
      labelPosition={labelPosition}
      labelSize={labelSize}
      hasLabel={hasLabel}
      hasDropdown={hasDropdown}
      size={size}
      onFocusChange={handleFocusChange}
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
  variant?: 'bare';
} & (
    | {
        onChange: (value: number) => void;
      }
    | {
        onSubmit: (value: number) => void;
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
    (value: string) => {
      const newValue = parseNumber(value);

      if (!isNaN(newValue)) {
        onSubmit?.(newValue);
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

const RootContainer = styled.div<{ width?: number; flex?: string }>(
  ({ theme, flex, width }) => ({
    flex: flex ?? '1',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    maxWidth: typeof width === 'number' ? `${width}px` : undefined,
  }),
);

interface InputFieldRootProps {
  id?: string;
  flex?: string;
  children?: ReactNode;
  width?: number;
  labelPosition?: LabelPosition;
  labelSize?: number;
  hasDropdown?: boolean;
  size?: InputFieldSize;
  renderPopoverContent?: (options: { width: number }) => ReactNode;
  onFocusChange?: (isFocused: boolean) => void;
}

function InputFieldRoot({
  id,
  flex,
  children,
  width,
  labelPosition = 'end',
  labelSize = 6,
  size = 'medium',
  renderPopoverContent,
  onFocusChange,
}: InputFieldRootProps) {
  const childrenArray = Children.toArray(children);

  const hasDropdown = childrenArray.some(
    (child) => isValidElement(child) && child.type === InputFieldDropdownMenu,
  );
  const hasLabel = childrenArray.some(
    (child) => isValidElement(child) && child.type === InputFieldLabel,
  );

  const [isFocused, setIsFocused] = React.useState(false);

  const [measuredWidth, setMeasuredWidth] = React.useState<number>();

  const handleFocusChange = useCallback(
    (isFocused: boolean) => {
      setIsFocused(isFocused);
      onFocusChange?.(isFocused);
    },
    [onFocusChange],
  );

  const [inputRef, setInputRef] =
    React.useState<ForwardedRef<HTMLInputElement>>();

  useEffect(() => {
    if (inputRef && typeof inputRef !== 'function') {
      setMeasuredWidth?.(
        isFocused
          ? inputRef?.current?.getBoundingClientRect().width
          : undefined,
      );
    }
  }, [inputRef, isFocused]);

  const contextValue = useMemo(
    (): InputFieldContextValue => ({
      labelPosition,
      labelSize,
      hasDropdown,
      hasLabel,
      size,
      isFocused,
      onFocusChange: handleFocusChange,
      inputRef,
      setInputRef,
    }),
    [
      labelPosition,
      labelSize,
      hasDropdown,
      hasLabel,
      size,
      isFocused,
      handleFocusChange,
      inputRef,
    ],
  );

  const rootElement = (
    <RootContainer id={id} width={width} flex={flex}>
      {children}
    </RootContainer>
  );

  return (
    <InputFieldContext.Provider value={contextValue}>
      {renderPopoverContent ? (
        <Popover
          open={true}
          trigger={rootElement}
          sideOffset={3}
          showArrow={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {measuredWidth && (
            <Stack.V width={measuredWidth} overflow="hidden">
              {renderPopoverContent({ width: measuredWidth })}
            </Stack.V>
          )}
        </Popover>
      ) : (
        rootElement
      )}
    </InputFieldContext.Provider>
  );
}

export namespace InputField {
  export const Root = memo(InputFieldRoot);
  export const Input = memo(InputFieldInput);
  export const NumberInput = memo(InputFieldNumberInput);
  export const DropdownMenu = InputFieldDropdownMenu;
  export const Button = InputFieldButton;
  export const Label = InputFieldLabel;
}
