import React, { CSSProperties, memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const CHEVRON_SVG = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' fill='white'>
    <path d='M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z'></path>
  </svg>
`;

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
      `calc(100% - 6px) / 15px url("data:image/svg+xml;utf8,${CHEVRON_SVG}") no-repeat`,
      theme.colors.inputBackground,
    ].join(','),
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
  }),
);

interface Props<T extends string> {
  id: string;
  flex?: CSSProperties['flex'];
  value: T;
  onChange: (value: T) => void;
  getTitle?: (option: T) => string;
  options: T[];
}

function Select<T extends string>({
  id,
  flex,
  value,
  onChange,
  options,
  getTitle,
}: Props<T>) {
  const optionElements = useMemo(
    () =>
      options.map((option) => (
        <option key={option} value={option}>
          {getTitle?.(option) ?? option}
        </option>
      )),
    [options, getTitle],
  );

  return (
    <SelectElement
      id={id}
      flex={flex}
      value={value}
      onChange={useCallback(
        (event) => {
          const newValue = event.target.value as T;
          onChange(newValue);
        },
        [onChange],
      )}
    >
      {optionElements}
    </SelectElement>
  );
}

export default memo(Select);
