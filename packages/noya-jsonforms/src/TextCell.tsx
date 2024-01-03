// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  CellProps,
  isStringControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { InputField } from '@noya-app/noya-designsystem';
import merge from 'lodash/merge';
import React from 'react';

export const TextCell = (props: CellProps) => {
  const { config, data, id, enabled, schema, uischema, path, handleChange } =
    props;
  // const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  return (
    <InputField.Root id={id}>
      <InputField.Input
        type="text"
        value={data || ''}
        onChange={(value) =>
          handleChange(path, value === '' ? undefined : value)
        }
        id={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        placeholder={schema.default}
        // maxLength={appliedUiSchemaOptions.restrict ? maxLength : undefined}
        // size={appliedUiSchemaOptions.trim ? maxLength : undefined}
      />
    </InputField.Root>
  );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const textCellTester: RankedTester = rankWith(1, isStringControl);

export const textCellRenderer = withJsonFormsCellProps(TextCell);
