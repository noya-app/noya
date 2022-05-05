import Sketch from 'noya-file-format';
import { Layout } from 'noya-designsystem';
import { memo, useCallback, useMemo } from 'react';
import { FillInputFieldWithPicker } from 'noya-workspace-ui';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  resizesContent: boolean;
  backgroundColor: Sketch.Color;
  hasBackgroundColor: boolean;
  includeBackgroundColorInExport: boolean;
  includeBackgroundColorInInstance: boolean;
  setAdjustContentOnResize: (value: boolean) => void;
  setHasBackgroundColor: (value: boolean) => void;
  setBackgroundColor: (value: Sketch.Color) => void;
  setIncludeBackgroundInExport: (value: boolean) => void;
  setIncludeBackgroundInInstances: (value: boolean) => void;
}

export default memo(function SymbolSourceRow({
  resizesContent,
  backgroundColor,
  hasBackgroundColor,
  includeBackgroundColorInExport,
  includeBackgroundColorInInstance,
  setAdjustContentOnResize,
  setHasBackgroundColor,
  setBackgroundColor,
  setIncludeBackgroundInExport,
  setIncludeBackgroundInInstances,
}: Props) {
  const setIncludeBackgroundInExportCallback = useCallback(
    (evt) => setIncludeBackgroundInExport(evt.target.checked),
    [setIncludeBackgroundInExport],
  );

  const setIncludeBackgroundInInstancesCallback = useCallback(
    (evt) => setIncludeBackgroundInInstances(evt.target.checked),
    [setIncludeBackgroundInInstances],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Symbol Source</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <InspectorPrimitives.Checkbox
          type="checkbox"
          checked={resizesContent}
          onChange={useCallback(
            (evt) => setAdjustContentOnResize(evt.target.checked),
            [setAdjustContentOnResize],
          )}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <InspectorPrimitives.Text>
          Adjust content on resize
        </InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <InspectorPrimitives.Checkbox
          type="checkbox"
          checked={hasBackgroundColor}
          onChange={useCallback(
            (evt) => setHasBackgroundColor(evt.target.checked),
            [setHasBackgroundColor],
          )}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <InspectorPrimitives.Text>Background color</InspectorPrimitives.Text>
        <Layout.Queue />
        <FillInputFieldWithPicker
          id={'colorInputId'}
          colorProps={useMemo(
            () => ({
              color: backgroundColor,
              onChangeColor: setBackgroundColor,
            }),
            [backgroundColor, setBackgroundColor],
          )}
        />
      </InspectorPrimitives.Row>
      {hasBackgroundColor && (
        <>
          <InspectorPrimitives.Row>
            <Layout.Queue size={12} />
            <InspectorPrimitives.Checkbox
              type="checkbox"
              checked={includeBackgroundColorInExport}
              onChange={setIncludeBackgroundInExportCallback}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <InspectorPrimitives.Text>
              Include in Export
            </InspectorPrimitives.Text>
          </InspectorPrimitives.Row>
          <InspectorPrimitives.Row>
            <Layout.Queue size={12} />
            <InspectorPrimitives.Checkbox
              type="checkbox"
              checked={includeBackgroundColorInInstance}
              onChange={setIncludeBackgroundInInstancesCallback}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <InspectorPrimitives.Text>
              Include in Instances
            </InspectorPrimitives.Text>
          </InspectorPrimitives.Row>
        </>
      )}
    </InspectorPrimitives.Section>
  );
});
