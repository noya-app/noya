import { ResetIcon } from 'noya-icons';
import Sketch from 'noya-file-format';
import {
  InputField,
  Spacer,
  TreeView,
  Select,
  Button,
} from 'noya-designsystem';
import { ApplicationState, Overrides, Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import { LayerIcon } from '../../containers/LayerList';
import { useApplicationState } from 'noya-app-state-context';
import * as InspectorPrimitives from './InspectorPrimitives';
interface Props {
  symbolMaster: Sketch.SymbolMaster;
  overrideValues: Sketch.OverrideValue[];
  onSetOverrideValue: (overrideName: string, value: string) => void;
  onResetOverrideValue: () => void;
}

const ThemeStyleSelector = ({
  themeStyles,
  sharedStyleID,
  onChange,
}: {
  themeStyles: Sketch.SharedStyle[];
  sharedStyleID: string;
  onChange: (value: string) => void;
}) => {
  const themeStylesOptions = useMemo(
    () => themeStyles.map((style) => style.do_objectID),
    [themeStyles],
  );

  const getThemeStylesTitle = useCallback(
    (id) => themeStyles.find((style) => style.do_objectID === id)!.name,
    [themeStyles],
  );

  return (
    <Select
      id="theme-style-selector"
      value={sharedStyleID}
      options={themeStylesOptions}
      getTitle={getThemeStylesTitle}
      onChange={onChange}
    />
  );
};

const TextStyleSelector = ({
  textStyles,
  sharedStyleID,
  onChange,
}: {
  textStyles: Sketch.SharedStyle[];
  sharedStyleID: string;
  onChange: (value: string) => void;
}) => {
  const textStylesOptions = useMemo(
    () => textStyles.map((style) => style.do_objectID),
    [textStyles],
  );

  const getTextStylesTitle = useCallback(
    (id) => textStyles.find((style) => style.do_objectID === id)!.name,
    [textStyles],
  );
  return (
    <Select
      id="text-style-selector"
      value={sharedStyleID}
      options={textStylesOptions}
      getTitle={getTextStylesTitle}
      onChange={onChange}
    />
  );
};

const SymbolMasterSelector = ({
  symbols,
  symbolId,
  onChange,
}: {
  symbols: Sketch.SymbolMaster[];
  symbolId: string;
  onChange: (value: string) => void;
}) => {
  const symbolSourceOptions = useMemo(
    () => ['none', ...symbols.map((symbol) => symbol.symbolID)],
    [symbols],
  );

  const getSymbolMasterTitle = useCallback(
    (id) =>
      id === 'none'
        ? 'No Symbol'
        : symbols.find((symbol) => symbol.symbolID === id)!.name,
    [symbols],
  );

  return (
    <Select
      id="symbol-instance-source"
      value={symbolId}
      options={symbolSourceOptions}
      getTitle={getSymbolMasterTitle}
      onChange={onChange}
    />
  );
};

function getOverrideElements(
  state: ApplicationState,
  symbolMaster: Sketch.SymbolMaster,
  idPath: string[],
  depth: number,
  overrideValues: Sketch.OverrideValue[],
  overrideProperties: Sketch.OverrideProperty[],
  onSetOverrideValue: (overrideName: string, value: string) => void,
): ReactNode[] {
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
        const symbolID =
          Overrides.getOverrideValue(overrideValues, 'symbolID', key) ??
          layer.symbolID;

        const symbolMaster = Selectors.findSymbolMaster(state, symbolID);
        if (!symbolMaster && symbolID !== 'none') return [];

        const nestedOverrides =
          symbolMaster && symbolMaster.allowsOverrides
            ? getOverrideElements(
                state,
                symbolMaster,
                nestedIdPath,
                depth + (canOverride('symbolID') ? 1 : 0),
                overrideValues,
                overrideProperties,
                onSetOverrideValue,
              )
            : [];

        const symbolIdOverrideName = key + '_symbolID';

        return [
          canOverride('symbolID') && titleRow,
          canOverride('symbolID') && (
            <TreeView.Row key={symbolIdOverrideName} depth={depth + 1}>
              <SymbolMasterSelector
                symbols={Selectors.getSymbols(state)}
                symbolId={symbolID}
                onChange={(value) =>
                  onSetOverrideValue(symbolIdOverrideName, value)
                }
              />
            </TreeView.Row>
          ),
          ...nestedOverrides,
        ];
      }
      case 'text': {
        const stringValueOverrideName = key + '_stringValue';
        const textStyleOverrideName = key + '_textStyle';

        return [
          (canOverride('stringValue') ||
            (layer.sharedStyleID && canOverride('textStyle'))) &&
            titleRow,
          canOverride('stringValue') && (
            <TreeView.Row key={stringValueOverrideName} depth={depth + 1}>
              <InputField.Root>
                <InputField.Input
                  value={
                    Overrides.getOverrideValue(
                      overrideValues,
                      'stringValue',
                      key,
                    ) ?? ''
                  }
                  placeholder={layer.attributedString.string}
                  onChange={(value) =>
                    onSetOverrideValue(stringValueOverrideName, value)
                  }
                />
              </InputField.Root>
            </TreeView.Row>
          ),
          layer.sharedStyleID && canOverride('textStyle') && (
            <TreeView.Row key={textStyleOverrideName} depth={depth + 1}>
              <TextStyleSelector
                textStyles={Selectors.getSharedTextStyles(state)}
                sharedStyleID={
                  Overrides.getOverrideValue(
                    overrideValues,
                    'textStyle',
                    key,
                  ) ?? layer.sharedStyleID
                }
                onChange={(value) =>
                  onSetOverrideValue(textStyleOverrideName, value)
                }
              />
            </TreeView.Row>
          ),
        ];
      }
      case 'bitmap': {
        const imageOverrideName = key + '_image';

        if (!canOverride('image')) return [];
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

        if (!canOverride('layerStyle')) return [];

        return layer.sharedStyleID
          ? [
              titleRow,
              layer.sharedStyleID && (
                <TreeView.Row key={layerStyleOverrideName} depth={depth + 1}>
                  <ThemeStyleSelector
                    themeStyles={Selectors.getSharedStyles(state)}
                    sharedStyleID={
                      Overrides.getOverrideValue(
                        overrideValues,
                        'layerStyle',
                        key,
                      ) ?? layer.sharedStyleID
                    }
                    onChange={(value) =>
                      onSetOverrideValue(layerStyleOverrideName, value)
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

export default memo(function SymbolInstanceOverridesRow({
  overrideValues,
  symbolMaster,
  onResetOverrideValue,
  onSetOverrideValue,
}: Props) {
  const [state] = useApplicationState();

  const overrideElements = getOverrideElements(
    state,
    symbolMaster,
    [],
    0,
    overrideValues,
    symbolMaster.overrideProperties,
    onSetOverrideValue,
  );

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.Row>
          <InspectorPrimitives.Title>Overrides</InspectorPrimitives.Title>
          <Spacer.Horizontal />

          <Button
            id="reset-symbol-sverrides"
            tooltip="Reset Overrides"
            onClick={onResetOverrideValue}
          >
            <ResetIcon />
          </Button>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      {symbolMaster.allowsOverrides && (
        <TreeView.Root expandable={false}>{overrideElements}</TreeView.Root>
      )}
    </>
  );
});
