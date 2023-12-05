/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
  CellProps,
  isNumberControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { InputField } from 'noya-designsystem';
import { round } from 'noya-utils';
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
