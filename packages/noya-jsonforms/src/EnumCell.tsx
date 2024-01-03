// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  EnumCellProps,
  isEnumControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsEnumCellProps } from '@jsonforms/react';
import { Select, SelectOption } from '@noya-app/noya-designsystem';
import React from 'react';

export const EnumCell = (props: EnumCellProps) => {
  const { data, id, path, handleChange, options } = props;

  return (
    <Select<string>
      id={id}
      // disabled={!enabled}
      // autoFocus={uischema.options && uischema.options.focus}
      value={data || ''}
    >
      {[
        <SelectOption
          value=""
          title="No Value"
          key="jsonforms.enum.none"
          onSelect={() => handleChange(path, undefined)}
        />,
      ].concat(
        (options ?? []).map((optionValue) => (
          <SelectOption
            value={optionValue.value}
            title={optionValue.label}
            key={optionValue.value}
            onSelect={() => handleChange(path, optionValue.value)}
          />
        )),
      )}
    </Select>
  );
};
/**
 * Default tester for enum controls.
 * @type {RankedTester}
 */
export const enumCellTester: RankedTester = rankWith(2, isEnumControl);

export const enumCellRenderer = withJsonFormsEnumCellProps(EnumCell);
