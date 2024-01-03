import { Divider, Spacer, TreeView } from '@noya-app/noya-designsystem';
import { Sketch } from '@noya-app/noya-file-format';
import { useApplicationState } from 'noya-app-state-context';
import { ApplicationState, Overrides, Selectors } from 'noya-state';
import React, { ReactNode, memo, useCallback } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';
import { LayerIcon } from './LayerIcon';

interface Props {
  symbolMaster: Sketch.SymbolMaster;
  onSetAllowsOverrides: (value: boolean) => void;
  onSetOverrideProperty: (overrideName: string, value: boolean) => void;
}

function getOverrideElements(
  state: ApplicationState,
  symbolMaster: Sketch.SymbolMaster,
  idPath: string[],
  overrideProperties: Sketch.OverrideProperty[],
  onSetOverrideProperty: (overrideName: string, value: boolean) => void,
): ReactNode[] {
  const depth = idPath.length;

  return [...symbolMaster.layers].reverse().flatMap((layer): ReactNode[] => {
    const nestedIdPath = [...idPath, layer.do_objectID];
    const key = nestedIdPath.join('/');

    const canOverride = (propertyType: Overrides.PropertyType) =>
      Overrides.canOverrideProperty(overrideProperties, propertyType, key);

    const titleRow = (
      <TreeView.Row
        key={key + ' title'}
        isSectionHeader
        depth={depth}
        icon={<LayerIcon type={layer._class} />}
      >
        <TreeView.RowTitle>{layer.name}</TreeView.RowTitle>
      </TreeView.Row>
    );

    switch (layer._class) {
      case 'symbolInstance': {
        const symbolMaster = Selectors.getSymbolMaster(state, layer.symbolID);

        if (!symbolMaster) return [];

        const nestedOverrides = symbolMaster.allowsOverrides
          ? getOverrideElements(
              state,
              symbolMaster,
              nestedIdPath,
              overrideProperties,
              onSetOverrideProperty,
            )
          : [];

        const symbolIdOverrideName = key + '_symbolID';

        return [
          titleRow,
          <TreeView.Row key={symbolIdOverrideName} depth={depth + 1}>
            <InspectorPrimitives.Checkbox
              type="checkbox"
              checked={canOverride('symbolID')}
              onChange={(event) =>
                onSetOverrideProperty(
                  symbolIdOverrideName,
                  event.target.checked,
                )
              }
            />
            <Spacer.Horizontal size={6} />
            <TreeView.RowTitle>Symbol</TreeView.RowTitle>
          </TreeView.Row>,
          ...nestedOverrides,
        ];
      }
      case 'text': {
        const stringValueOverrideName = key + '_stringValue';
        const textStyleOverrideName = key + '_textStyle';

        return [
          titleRow,
          <TreeView.Row key={stringValueOverrideName} depth={depth + 1}>
            <InspectorPrimitives.Checkbox
              type="checkbox"
              checked={canOverride('stringValue')}
              onChange={(event) =>
                onSetOverrideProperty(
                  stringValueOverrideName,
                  event.target.checked,
                )
              }
            />
            <Spacer.Horizontal size={6} />
            <TreeView.RowTitle>Text Value</TreeView.RowTitle>
          </TreeView.Row>,
          layer.sharedStyleID && (
            <TreeView.Row key={textStyleOverrideName} depth={depth + 1}>
              <InspectorPrimitives.Checkbox
                type="checkbox"
                checked={canOverride('textStyle')}
                onChange={(event) =>
                  onSetOverrideProperty(
                    textStyleOverrideName,
                    event.target.checked,
                  )
                }
              />
              <Spacer.Horizontal size={6} />
              <TreeView.RowTitle>Text Style</TreeView.RowTitle>
            </TreeView.Row>
          ),
        ];
      }
      case 'bitmap': {
        const imageOverrideName = key + '_image';

        return [
          titleRow,
          <TreeView.Row key={imageOverrideName} depth={depth + 1}>
            <InspectorPrimitives.Checkbox
              type="checkbox"
              checked={canOverride('image')}
              onChange={(event) =>
                onSetOverrideProperty(imageOverrideName, event.target.checked)
              }
            />
            <Spacer.Horizontal size={6} />
            <TreeView.RowTitle>Image</TreeView.RowTitle>
          </TreeView.Row>,
        ];
      }
      default: {
        const layerStyleOverrideName = key + '_layerStyle';

        return layer.sharedStyleID
          ? [
              titleRow,
              layer.sharedStyleID && (
                <TreeView.Row key={layerStyleOverrideName} depth={depth + 1}>
                  <InspectorPrimitives.Checkbox
                    type="checkbox"
                    checked={canOverride('layerStyle')}
                    onChange={(event) =>
                      onSetOverrideProperty(
                        layerStyleOverrideName,
                        event.target.checked,
                      )
                    }
                  />
                  <Spacer.Horizontal size={6} />
                  <TreeView.RowTitle>Layer Style</TreeView.RowTitle>
                </TreeView.Row>
              ),
            ]
          : [];
      }
    }
  });
}

export const SymbolMasterOverrideRow = memo(function SymbolMasterOverrideRow({
  symbolMaster,
  onSetAllowsOverrides,
  onSetOverrideProperty,
}: Props) {
  const [state] = useApplicationState();

  const overrideElements = getOverrideElements(
    state,
    symbolMaster,
    [],
    symbolMaster.overrideProperties,
    onSetOverrideProperty,
  );

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Manage Overrides
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row>
          <InspectorPrimitives.Checkbox
            type="checkbox"
            checked={symbolMaster.allowsOverrides}
            onChange={useCallback(
              (event) => onSetAllowsOverrides(event.target.checked),
              [onSetAllowsOverrides],
            )}
          />
          <InspectorPrimitives.HorizontalSeparator />
          <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
        </InspectorPrimitives.Row>
        <InspectorPrimitives.VerticalSeparator />
        <Divider />
      </InspectorPrimitives.Section>
      <TreeView.Root expandable={false}>{overrideElements}</TreeView.Root>
    </>
  );
});
