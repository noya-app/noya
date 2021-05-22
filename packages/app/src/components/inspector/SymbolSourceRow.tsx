import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Spacer } from 'noya-designsystem';
import { memo } from 'react';
import styled from 'styled-components';
import ColorInputFieldWithPicker from './ColorInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

interface Props {
  resizesContent: boolean;
  backgroundColor: Sketch.Color;
  hasBackgroundColor: boolean;
  includeBackgroundColorInExport: boolean;
  includeBackgroundColorInInstance: boolean;
  setAdjustContentOnResize: (value: boolean) => void;
  setHasBackgroundColor: (value: boolean) => void;
  setBackgroundColor: (value: Sketch.Color) => void;
  setIncludeBgInExport: (value: boolean) => void;
  setIncludeBgInInstances: (value: boolean) => void;
}

export default memo(function SymbolInspector({
  resizesContent,
  backgroundColor,
  hasBackgroundColor,
  includeBackgroundColorInExport,
  includeBackgroundColorInInstance,
  setAdjustContentOnResize,
  setHasBackgroundColor,
  setBackgroundColor,
  setIncludeBgInExport,
  setIncludeBgInInstances,
}: Props) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Symbol Source</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <Checkbox
          type="checkbox"
          checked={resizesContent}
          onChange={(evt) => setAdjustContentOnResize(evt.target.checked)}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>
          Adjust content on resize
        </InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.Row>
        <Checkbox
          type="checkbox"
          checked={hasBackgroundColor}
          onChange={(evt) => setHasBackgroundColor(evt.target.checked)}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>Background color</InspectorPrimitives.Text>
        <Spacer.Horizontal size={65} />
        <ColorInputFieldWithPicker
          id={'colorInputId'}
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
      </InspectorPrimitives.Row>
      {hasBackgroundColor && (
        <>
          <InspectorPrimitives.Row>
            <Spacer.Horizontal size={12} />
            <Checkbox
              type="checkbox"
              checked={includeBackgroundColorInExport}
              onChange={(evt) => setIncludeBgInExport(evt.target.checked)}
            />
            <Spacer.Horizontal size={8} />
            <InspectorPrimitives.Text>
              Include in Export
            </InspectorPrimitives.Text>
          </InspectorPrimitives.Row>
          <InspectorPrimitives.Row>
            <Spacer.Horizontal size={12} />
            <Checkbox
              type="checkbox"
              checked={includeBackgroundColorInInstance}
              onChange={(evt) => setIncludeBgInInstances(evt.target.checked)}
            />
            <Spacer.Horizontal size={8} />
            <InspectorPrimitives.Text>
              Include in Instances
            </InspectorPrimitives.Text>
          </InspectorPrimitives.Row>
        </>
      )}
    </InspectorPrimitives.Section>
  );
});
