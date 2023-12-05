// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  findUISchema,
  Generate,
  isObjectControl,
  RankedTester,
  rankWith,
  StatePropsOfControlWithDetail,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsDetailProps } from '@jsonforms/react';
import isEmpty from 'lodash/isEmpty';
// import { Hidden } from '@mui/material';
import React, { useMemo } from 'react';

export const MaterialObjectRenderer = ({
  renderers,
  cells,
  uischemas,
  schema,
  label,
  path,
  visible,
  enabled,
  uischema,
  rootSchema,
}: StatePropsOfControlWithDetail) => {
  const detailUiSchema = useMemo(
    () =>
      findUISchema(
        uischemas!,
        schema,
        uischema.scope,
        path,
        () =>
          isEmpty(path)
            ? Generate.uiSchema(schema, 'VerticalLayout', undefined, rootSchema)
            : {
                ...Generate.uiSchema(schema, 'Group', undefined, rootSchema),
                label,
              },
        uischema,
        rootSchema,
      ),
    [uischemas, schema, path, label, uischema, rootSchema],
  );

  return (
    <JsonFormsDispatch
      visible={visible}
      enabled={enabled}
      schema={schema}
      uischema={detailUiSchema}
      path={path}
      renderers={renderers}
      cells={cells}
    />
  );
};

export const objectControlTester: RankedTester = rankWith(2, isObjectControl);

export const objectRenderer = withJsonFormsDetailProps(MaterialObjectRenderer);
