// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  LayoutProps,
  RankedTester,
  rankWith,
  uiTypeIs,
  VerticalLayout,
} from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Heading5, Stack, useDesignSystemTheme } from 'noya-designsystem';
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

const VerticalLayoutRenderer = (props: LayoutProps) => {
  const theme = useDesignSystemTheme();
  const { uischema, schema, path, enabled, label } = props;

  const verticalLayout = uischema as VerticalLayout;

  // console.log('vertical layout', label);

  return (
    <Stack.V
      {...(label && {
        background: theme.colors.listView.raisedBackground,
        padding: '12px',
        borderRadius: '4px',
        border: `1px solid ${theme.colors.dividerSubtle}`,
      })}
    >
      {label && (
        <Heading5 color="textMuted" textDecoration="underline">
          {label}
        </Heading5>
      )}
      <Stack.V alignItems="stretch" gap="12px">
        {useChildren(verticalLayout, schema, path, enabled)}
      </Stack.V>
    </Stack.V>
  );
};

export const verticalLayoutRenderer = withJsonFormsLayoutProps(
  VerticalLayoutRenderer,
);
