import Sketch from '@sketch-hq/sketch-file-format-ts';
import { InputField, Spacer, TreeView, Select } from 'noya-designsystem';
import { ApplicationState, Layers, Overrides } from 'noya-state';
import {
  getSharedStyles,
  getSharedTextStyles,
  getSymbols,
} from 'noya-state/src/selectors/themeSelectors';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import * as InspectorPrimitives from './InspectorPrimitives';

const NO_STYLE = 'none';

interface Props {
  symbolInstance: Sketch.SymbolInstance;
  symbolMaster?: Sketch.SymbolMaster;
  onSetAllowsOverrides?: (value: boolean) => void;
}

type Selectors = {
  symbols: Sketch.SymbolMaster[];
  textStyles: Sketch.SharedStyle[];
  themeStyles: Sketch.SharedStyle[];
};

const ThemeStyleSelector = ({
  themeStyles,
  sharedStyleID,
}: {
  themeStyles: Sketch.SharedStyle[];
  sharedStyleID: string;
}) => {
  const themeStylesOptions = useMemo(
    () => [NO_STYLE, ...themeStyles.map((style) => style.do_objectID)],
    [themeStyles],
  );

  const getThemeStylesTitle = useCallback(
    (id) =>
      id === NO_STYLE
        ? 'No Layer Style'
        : themeStyles.find((style) => style.do_objectID === id)!.name,
    [themeStyles],
  );

  return (
    <Select
      id="theme-style-selector"
      value={sharedStyleID}
      options={themeStylesOptions}
      getTitle={getThemeStylesTitle}
      onChange={() => {}}
    />
  );
};

const TextStyleSelector = ({
  textStyles,
  sharedStyleID,
}: {
  textStyles: Sketch.SharedStyle[];
  sharedStyleID: string;
}) => {
  const textStylesOptions = useMemo(
    () => [NO_STYLE, ...textStyles.map((style) => style.do_objectID)],
    [textStyles],
  );

  const getTextStylesTitle = useCallback(
    (id) =>
      id === NO_STYLE
        ? 'No Layer Style'
        : textStyles.find((style) => style.do_objectID === id)!.name,
    [textStyles],
  );
  return (
    <Select
      id="text-style-selector"
      value={sharedStyleID}
      options={textStylesOptions}
      getTitle={getTextStylesTitle}
      onChange={() => {}}
    />
  );
};

const SymbolMasterSelector = ({
  symbols,
  symbolId,
}: {
  symbols: Sketch.SymbolMaster[];
  symbolId: string;
}) => {
  const symbolSourceOptions = useMemo(
    () => symbols.map((symbol) => symbol.symbolID),
    [symbols],
  );

  const getSymbolMasterTitle = useCallback(
    (id) => symbols.find((symbol) => symbol.symbolID === id)!.name,
    [symbols],
  );
  return (
    <Select
      id="symbol-instance-source"
      value={symbolId}
      options={symbolSourceOptions}
      getTitle={getSymbolMasterTitle}
      onChange={() => {}}
    />
  );
};

function getOverrideElements(
  state: ApplicationState,
  symbolMaster: Sketch.SymbolMaster,
  idPath: string[],
  selectors: Selectors,
  overrideValues: Sketch.OverrideValue[],
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
      <TreeView.Row key={key + ' title'} isSectionHeader depth={depth}>
        <TreeView.RowTitle>{layer.name}</TreeView.RowTitle>
      </TreeView.Row>
    );

    const overrideValue = (propertyType: Overrides.PropertyType) => {
      const value = overrideValues.find(({ overrideName }) => {
        const [idPathString, type] = overrideName.split('_');
        return idPathString === key && type === propertyType;
      })?.value;

      if (!value) return undefined;

      return Overrides.getLayerOverride(layer, propertyType, value);
    };

    switch (layer._class) {
      case 'symbolInstance': {
        if (!canOverrideProperty('symbolID')) return [null];

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
              selectors,
              overrideValues,
              overrideProperties,
              onSetOverrideProperty,
            )
          : [];

        const symbolIdOverrideName = key + '_symbolID';

        return [
          titleRow,
          <TreeView.Row key={symbolIdOverrideName} depth={depth + 1}>
            <SymbolMasterSelector
              symbols={selectors.symbols}
              symbolId={symbolMaster.symbolID}
            />
          </TreeView.Row>,
          ...nestedOverrides,
        ];
      }
      case 'text': {
        const stringValueOverrideName = key + '_stringValue';
        const textStyleOverrideName = key + '_textStyle';

        return [
          (canOverrideProperty('stringValue') ||
            (layer.sharedStyleID && canOverrideProperty('textStyle'))) &&
            titleRow,
          canOverrideProperty('stringValue') && (
            <TreeView.Row key={stringValueOverrideName} depth={depth + 1}>
              <InputField.Root>
                <InputField.Input
                  value={(overrideValue('stringValue')?.value as string) ?? ''}
                  placeholder={layer.name}
                  onChange={() => {}}
                />
              </InputField.Root>
            </TreeView.Row>
          ),
          layer.sharedStyleID && canOverrideProperty('textStyle') && (
            <TreeView.Row key={textStyleOverrideName} depth={depth + 1}>
              <TextStyleSelector
                textStyles={selectors.textStyles}
                sharedStyleID={
                  (overrideValue('textStyle')?.value as string) ??
                  layer.sharedStyleID
                }
              />
            </TreeView.Row>
          ),
        ];
      }
      case 'bitmap': {
        const imageOverrideName = key + '_image';

        if (!canOverrideProperty('image')) return [null];
        return [
          titleRow,
          <TreeView.Row key={imageOverrideName} depth={depth + 1}>
            <InputField.Root>
              <InputField.Input
                value={''}
                placeholder={''}
                onChange={() => {}}
              />
            </InputField.Root>
          </TreeView.Row>,
        ];
      }
      default: {
        const layerStyleOverrideName = key + '_layerStyle';

        if (!canOverrideProperty('layerStyle')) return [null];

        return layer.sharedStyleID
          ? [
              titleRow,
              layer.sharedStyleID && (
                <TreeView.Row key={layerStyleOverrideName} depth={depth + 1}>
                  <ThemeStyleSelector
                    themeStyles={selectors.themeStyles}
                    sharedStyleID={
                      (overrideValue('layerStyle')?.value as string) ??
                      layer.sharedStyleID
                    }
                  />
                </TreeView.Row>
              ),
            ]
          : [];
      }
    }
  });
}

export default memo(function SymbolInspector({
  symbolInstance,
  symbolMaster,
  onSetAllowsOverrides,
}: Props) {
  const [state] = useApplicationState();

  const themeStyles = getSharedStyles(state);
  const textStyles = getSharedTextStyles(state);
  const symbols = getSymbols(state);

  const selectors = { themeStyles, textStyles, symbols };
  if (!symbolMaster) return null;

  const overrideElements = getOverrideElements(
    state,
    symbolMaster,
    [],
    selectors,
    symbolInstance.overrideValues,
    symbolMaster.overrideProperties,
    () => {},
  );

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.Title>Overrides</InspectorPrimitives.Title>
      </InspectorPrimitives.Section>
      <Spacer.Vertical size={6} />
      <TreeView.Root>{overrideElements}</TreeView.Root>
    </>
  );
});
