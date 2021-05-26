import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Spacer, TreeView } from 'noya-designsystem';
import { ApplicationState, Layers, Overrides } from 'noya-state';
import { memo, ReactNode, useCallback } from 'react';
import { LayerIcon } from '../../containers/LayerList';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import * as InspectorPrimitives from './InspectorPrimitives';

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

    const canOverrideProperty = (propertyType: Overrides.PropertyType) =>
      overrideProperties.find((property) => {
        const [idPathString, type] = property.overrideName.split('_');
        return idPathString === key && type === propertyType;
      })?.canOverride ?? true;

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
        const symbolMaster = Layers.findInArray(
          state.sketch.pages,
          (child) =>
            Layers.isSymbolMaster(child) && layer.symbolID === child.symbolID,
        ) as Sketch.SymbolMaster | undefined;

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
              checked={canOverrideProperty('symbolID')}
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
              checked={canOverrideProperty('stringValue')}
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
                checked={canOverrideProperty('textStyle')}
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
              checked={canOverrideProperty('image')}
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
                    checked={canOverrideProperty('layerStyle')}
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

export default memo(function SymbolInspector({
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
        <InspectorPrimitives.Title>Manage Overrides</InspectorPrimitives.Title>
        <Spacer.Vertical size={2} />
        <InspectorPrimitives.Row>
          <InspectorPrimitives.Checkbox
            type="checkbox"
            checked={symbolMaster.allowsOverrides}
            onChange={useCallback(
              (event) => onSetAllowsOverrides(event.target.checked),
              [onSetAllowsOverrides],
            )}
          />
          <Spacer.Horizontal size={8} />
          <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      <Spacer.Vertical size={6} />
      <TreeView.Root>{overrideElements}</TreeView.Root>
    </>
  );
});
