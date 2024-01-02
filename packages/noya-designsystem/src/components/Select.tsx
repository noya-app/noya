import { memoize } from '@noya-app/noya-utils';
import React, {
  createContext,
  CSSProperties,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';

type SelectContextValue = {
  addListener: (value: string, listener: () => void) => void;
  removeListener: (value: string) => void;
};

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectOptionProps<T extends string> {
  value: T;
  title?: string;
  onSelect?: () => void;
}

export const SelectOption = memo(function SelectOption<T extends string>({
  value,
  title,
  onSelect,
}: SelectOptionProps<T>) {
  const { addListener, removeListener } = useContext(SelectContext)!;

  useEffect(() => {
    if (!onSelect) return;

    addListener(value, onSelect);

    return () => removeListener(value);
  }, [addListener, onSelect, removeListener, value]);

  return <option value={value}>{title ?? value}</option>;
});

const createChevronSVGString = memoize(
  (color: string) => `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' fill='${color}'>
    <path d='M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z'></path>
  </svg>
`,
);

const SelectElement = styled.select<{ flex: CSSProperties['flex'] }>(
  ({ theme, flex }) => ({
    appearance: 'none',
    ...theme.textStyles.small,
    color: theme.colors.text,
    width: '0px', // Reset intrinsic width
    flex: flex ?? '1 1 0px',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: 'left',
    alignSelf: 'stretch',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '8px',
    paddingRight: '23px',
    background: [
      `calc(100% - 6px) / 15px url("data:image/svg+xml;utf8,${createChevronSVGString(
        theme.colors.icon,
      )}") no-repeat`,
      theme.colors.inputBackground,
    ].join(','),
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
  }),
);

type ChildrenProps<T> =
  | {
      children: ReactNode;
    }
  | {
      options: T[];
      getTitle?: (option: T, index: number) => string;
      onChange: (value: T) => void;
    };

type Props<T extends string> = ChildrenProps<T> & {
  id: string;
  flex?: CSSProperties['flex'];
  value: T;
};

export const Select = memo(function Select<T extends string>({
  id,
  flex,
  value,
  ...rest
}: Props<T>) {
  const options = 'options' in rest ? rest.options : undefined;
  const getTitle = 'options' in rest ? rest.getTitle : undefined;
  const onChange = 'options' in rest ? rest.onChange : undefined;
  const children = 'options' in rest ? undefined : rest.children;

  const optionElements = useMemo(
    () =>
      options
        ? options.map((option, index) => (
            <SelectOption
              key={option}
              value={option}
              title={getTitle?.(option, index)}
              onSelect={() => onChange?.(option)}
            />
          ))
        : children,
    [children, getTitle, onChange, options],
  );

  const listeners = useRef<Map<string, () => void>>(new Map());

  const contextValue: SelectContextValue = useMemo(
    () => ({
      addListener: (value, listener) => listeners.current.set(value, listener),
      removeListener: (value) => listeners.current.delete(value),
    }),
    [],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <SelectElement
        id={id}
        flex={flex}
        value={value}
        onChange={useCallback(
          (event) => listeners.current.get(event.target.value)?.(),
          [listeners],
        )}
      >
        {optionElements}
      </SelectElement>
    </SelectContext.Provider>
  );
});
