import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';

import { useSelector } from 'noya-app-state-context';
import { Button, Select, Layout } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { useShallowArray } from 'noya-react-utils';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  symbolId: string;
  onSelect: (value: string) => void;
  onDetach: () => void;
  onEditSource: () => void;
}

export default memo(function SymbolSelectorRow({
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
          <Layout.Icon name="link-break-2" color={iconColor} />
        </Button>
        <InspectorPrimitives.HorizontalSeparator />
        <Button
          id="edit-source-symbol"
          flex="1 1 0%"
          disabled={symbolId === undefined}
          tooltip="Edit Symbol Source"
          onClick={onEditSource}
        >
          <Layout.Icon name="component-instance" color={iconColor} />
        </Button>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
