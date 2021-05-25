import { Spacer } from 'noya-designsystem';
import { memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';
import styled from 'styled-components';

interface Props {
  allowsOverrides: boolean;
  setAllowOverride: (value: boolean) => void;
}

const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

export default memo(function SymbolInspector({
  allowsOverrides,
  setAllowOverride,
}: Props) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Manage Overrides</InspectorPrimitives.Title>
      <Spacer.Vertical size={2} />
      <InspectorPrimitives.Row>
        <Checkbox
          type="checkbox"
          checked={allowsOverrides}
          onChange={(evt) => setAllowOverride(evt.target.checked)}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
    </InspectorPrimitives.Section>
  );
});
