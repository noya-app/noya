// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  CombinatorRendererProps,
  createCombinatorRenderInfos,
  createDefaultValue,
  isAnyOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsAnyOfProps } from '@jsonforms/react';
// import { Tab, Tabs } from '@mui/material';
import {
  RadioGroup,
  Stack,
  useDesignSystemTheme,
} from '@noya-app/noya-designsystem';
import isEmpty from 'lodash/isEmpty';
import React, { useCallback, useState } from 'react';
import { CombinatorProperties } from './CombinatorProperties';
// import { TabSwitchConfirmDialog } from './TabSwitchConfirmDialog';

export const MaterialAnyOfRenderer = ({
  handleChange,
  schema,
  rootSchema,
  indexOfFittingSchema,
  visible,
  path,
  renderers,
  cells,
  uischema,
  uischemas,
  id,
  data,
}: CombinatorRendererProps) => {
  const [selectedAnyOf, setSelectedAnyOf] = useState(indexOfFittingSchema || 0);
  // const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  // const [newSelectedIndex, setNewSelectedIndex] = useState(0);

  const anyOf = 'anyOf';
  const anyOfRenderInfos = createCombinatorRenderInfos(
    (schema as any).anyOf,
    rootSchema,
    anyOf,
    uischema,
    path,
    uischemas,
  );

  const isRoot = path === undefined || path === '';
  const theme = useDesignSystemTheme();

  // const handleClose = useCallback(
  //   () => setConfirmDialogOpen(false),
  //   [setConfirmDialogOpen],
  // );

  const handleTabChange = useCallback(
    (_event: any, newIndex: number) => {
      if (
        isEmpty(data) ||
        typeof data ===
          typeof createDefaultValue(anyOfRenderInfos[newIndex].schema)
      ) {
        setSelectedAnyOf(newIndex);
      } else {
        // setNewSelectedIndex(newIndex);
        // setConfirmDialogOpen(true);
      }
    },
    [data, anyOfRenderInfos],
  );

  // const openNewTab = (newIndex: number) => {
  //   handleChange(path, createDefaultValue(anyOfRenderInfos[newIndex].schema));
  //   setSelectedAnyOf(newIndex);
  // };

  // const confirm = useCallback(() => {
  //   openNewTab(newSelectedIndex);
  //   setConfirmDialogOpen(false);
  // }, [handleChange, createDefaultValue, newSelectedIndex]);

  return (
    <Stack.V
      gap="4px"
      {...(!isRoot && {
        background: theme.colors.listView.raisedBackground,
        padding: '12px',
        borderRadius: '4px',
        border: `1px solid ${theme.colors.dividerSubtle}`,
      })}
    >
      <CombinatorProperties
        schema={schema}
        combinatorKeyword={anyOf}
        path={path}
        rootSchema={rootSchema}
      />
      <Stack.H flex="0" alignItems="stretch">
        <RadioGroup.Root
          value={selectedAnyOf.toString()}
          onValueChange={(item: string) => {
            handleTabChange(null, parseInt(item));
          }}
        >
          {anyOfRenderInfos.map((anyOfRenderInfo, index) => (
            <RadioGroup.Item
              key={anyOfRenderInfo.label}
              value={index.toString()}
            >
              {anyOfRenderInfo.label}
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </Stack.H>
      {anyOfRenderInfos.map(
        (anyOfRenderInfo, anyOfIndex) =>
          selectedAnyOf === anyOfIndex && (
            <JsonFormsDispatch
              key={anyOfIndex}
              schema={anyOfRenderInfo.schema}
              uischema={anyOfRenderInfo.uischema}
              path={path}
              renderers={renderers}
              cells={cells}
            />
          ),
      )}
      {/* <TabSwitchConfirmDialog
        cancel={handleClose}
        confirm={confirm}
        id={'anyOf-' + id}
        open={confirmDialogOpen}
        handleClose={handleClose}
      /> */}
    </Stack.V>
  );
};

export const anyOfTester: RankedTester = rankWith(3, isAnyOfControl);
export const AnyOfRenderer = withJsonFormsAnyOfProps(MaterialAnyOfRenderer);
