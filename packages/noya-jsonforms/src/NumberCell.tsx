// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  CellProps,
  isNumberControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { round } from '@noya-app/noya-utils';
import { InputField } from 'noya-designsystem';
import React from 'react';

const toNumber = (value: number, defaultValue: number | undefined) =>
  value === undefined || isNaN(value) ? defaultValue : Number(value);

export const NumberCell = (props: CellProps) => {
  const { data, id, enabled, path, handleChange, schema, uischema } = props;

  return (
    <InputField.Root id={id}>
      <InputField.NumberInput
        value={data === undefined ? data : round(data, 2)}
        placeholder={schema.default}
        onChange={(value) => handleChange(path, toNumber(value, undefined))}
        onNudge={(value) =>
          handleChange(path, toNumber(data + value, undefined))
        }
        disabled={!enabled}
        autoFocus={uischema.options && uischema.options.focus}
      />
    </InputField.Root>
  );
};

/**
 * Default tester for number controls.
 * @type {RankedTester}
 */
export const numberCellTester: RankedTester = rankWith(2, isNumberControl);

export const numberCell = withJsonFormsCellProps(NumberCell);
