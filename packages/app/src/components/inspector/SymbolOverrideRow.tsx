import { Spacer } from 'noya-designsystem';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  allowsOverrides: boolean;
  setAllowsOverrides: (value: boolean) => void;
}

export default memo(function SymbolInspector({
  allowsOverrides,
  setAllowsOverrides,
}: Props) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Manage Overrides</InspectorPrimitives.Title>
      <Spacer.Vertical size={2} />
      <InspectorPrimitives.Row>
        <InspectorPrimitives.Checkbox
          type="checkbox"
          checked={allowsOverrides}
          onChange={useCallback(
            (evt) => setAllowsOverrides(evt.target.checked),
            [setAllowsOverrides],
          )}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
    </InspectorPrimitives.Section>
  );
});
