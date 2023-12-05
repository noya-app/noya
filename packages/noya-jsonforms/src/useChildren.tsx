// https://github.com/eclipsesource/jsonforms (MIT License)

import { JsonSchema, Layout } from '@jsonforms/core';
import { JsonFormsDispatch, useJsonForms } from '@jsonforms/react';
import isEmpty from 'lodash/isEmpty';
import React from 'react';

export interface RenderChildrenProps {
  layout: Layout;
  schema: JsonSchema;
  className: string;
  path: string;
}

export const useChildren = (
  layout: Layout,
  schema: JsonSchema,
  path: string,
  enabled: boolean,
) => {
  const { renderers, cells } = useJsonForms();

  if (isEmpty(layout.elements)) {
    // console.log('empty layout');
    return [];
  }

  // console.log('layout', layout);

  return layout.elements.map((child, index) => {
    return (
      <JsonFormsDispatch
        key={index}
        renderers={renderers}
        cells={cells}
        uischema={child}
        schema={schema}
        path={path}
        enabled={enabled}
      />
    );
  });
};
