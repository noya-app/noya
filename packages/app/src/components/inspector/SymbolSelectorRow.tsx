import { LinkBreak2Icon, ComponentInstanceIcon } from '@radix-ui/react-icons';
import { Button, Select, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import * as InspectorPrimitives from './InspectorPrimitives';
import { useSelector } from 'noya-app-state-context';
import useShallowArray from '../../hooks/useShallowArray';

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
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Select
          id="symbol-instance-source"
          value={symbolId}
          options={symbolSourceOptions}
          getTitle={getSymbolMasterTitle}
          onChange={onSelect}
        />
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Button
          id="detach-source-symbol"
          disabled={symbolId === undefined}
          tooltip="Detach instance from symbol"
          onClick={onDetach}
        >
          <LinkBreak2Icon color={iconColor} />
        </Button>
        <Spacer.Horizontal size={10} />
        <Button
          id="edit-source-symbol"
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
