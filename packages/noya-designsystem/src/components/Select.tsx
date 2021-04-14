import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const SelectElement = styled.select(({ theme }) => ({
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
  paddingLeft: '4px',
  paddingRight: '4px',
  background: theme.colors.inputBackground,
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

interface Props<T extends string> {
  id: string;
  value: T;
  onChange: (value: T) => void;
  getTitle?: (option: T) => string;
  options: T[];
}

function Select<T extends string>({
  id,
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
