import {
  RankedTester,
  rankWith,
  RendererProps,
  uiTypeIs,
  VerticalLayout,
} from '@jsonforms/core';
import { Stack } from 'noya-designsystem';
import React from 'react';
import { useChildren } from './useChildren';
// import { withVanillaControlProps } from '../util';
// import { JsonFormsLayout } from './JsonFormsLayout';
// import { renderChildren } from './util';
// import { VanillaRendererProps } from '../index';

export const verticalLayoutTester: RankedTester = rankWith(
  1,
  uiTypeIs('VerticalLayout'),
);

export const VerticalLayoutRenderer = (props: RendererProps) => {
  const { uischema, schema, path, enabled } = props;

  const verticalLayout = uischema as VerticalLayout;

  return (
    <Stack.V flex="0" alignItems="stretch" gap="12px">
      {useChildren(verticalLayout, schema, path, enabled)}
    </Stack.V>
  );
};
