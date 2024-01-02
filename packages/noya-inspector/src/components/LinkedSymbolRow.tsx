import { useShallowArray } from '@noya-app/react-utils';
import { useSelector } from 'noya-app-state-context';
import { Button, Select } from 'noya-designsystem';
import { ComponentInstanceIcon, LinkBreak2Icon } from 'noya-icons';
import { Selectors } from 'noya-state';
import React, { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  symbolId: string;
  onSelect: (value: string) => void;
  onDetach: () => void;
  onEditSource: () => void;
}

export const LinkedSymbolRow = memo(function LinkedSymbolRow({
  symbolId,
  onSelect,
  onDetach,
  onEditSource,
}: Props) {
  const symbols = useShallowArray(useSelector(Selectors.getSymbols));

  const iconColor = useTheme().colors.icon;

  const symbolSourceOptions = useMemo(
    () => symbols.map((symbol) => symbol.symbolID),
    [symbols],
  );

  const getSymbolMasterTitle = useCallback(
    (id) => symbols.find((symbol) => symbol.symbolID === id)!.name,
    [symbols],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Symbol</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <Select
          id="symbol-instance-source"
          value={symbolId}
          options={symbolSourceOptions}
          getTitle={getSymbolMasterTitle}
          onChange={onSelect}
        />
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <Button
          id="detach-source-symbol"
          flex="1 1 0%"
          disabled={symbolId === undefined}
          tooltip="Detach instance from symbol"
          onClick={onDetach}
        >
          <LinkBreak2Icon color={iconColor} />
        </Button>
        <InspectorPrimitives.HorizontalSeparator />
        <Button
          id="edit-source-symbol"
          flex="1 1 0%"
          disabled={symbolId === undefined}
          tooltip="Edit Symbol Source"
          onClick={onEditSource}
        >
          <ComponentInstanceIcon color={iconColor} />
        </Button>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
