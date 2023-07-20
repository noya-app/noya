import { useApplicationState } from 'noya-app-state-context';
import {
  Chip,
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  Stack,
  TreeView,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { DragHandleDots2Icon } from 'noya-icons';
import { ApplicationState, Overrides, Selectors } from 'noya-state';
import React, { useCallback, useEffect, useMemo } from 'react';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { getAllInsertableSymbols } from '../../symbols/symbols';
import { allClassNames } from '../../tailwind/tailwind';
import { HashtagIcon } from './HashtagIcon';

function getCompletionItems({
  state,
  layer,
  master,
}: {
  state: ApplicationState;
  layer: Sketch.SymbolInstance;
  master: Sketch.SymbolMaster;
}) {
  const blockItems = getAllInsertableSymbols(state).map(
    (block): CompletionItem => ({
      id: 'block:' + block.symbolID,
      name: block.name,
    }),
  );

  const styleItems = (master.blockDefinition?.hashtags ?? allClassNames)
    .map((item) => ({
      name: item,
      id: 'style:' + item,
      icon: <HashtagIcon item={item} />,
    }))
    // Filter styles that are already applied
    .filter((item) => !layer.blockParameters?.includes(item.name));

  return [...blockItems, ...styleItems];
}

export function AyonLayerListRow({
  layer,
  depth,
  path,
  isDragging,
  onSetOverriddenBlock,
}: {
  layer: Sketch.SymbolInstance;
  depth: number;
  path: string[];
  isDragging: boolean;
  onSetOverriddenBlock: (
    overriddenBlock: BlockPreviewProps | undefined,
  ) => void;
}) {
  const theme = useDesignSystemTheme();
  const [state, dispatch] = useApplicationState();
  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );
  const master = getSymbolMaster(layer.symbolID);
  const componentName = master.name.toUpperCase();
  const placeholderText = master.blockDefinition?.placeholderText;
  const key = path.join('/');

  const [hovered, setHovered] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

  const completionItems = useMemo(
    () =>
      getCompletionItems({
        state,
        layer,
        master,
      }),
    [layer, master, state],
  );

  const modalSearchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      modalSearchInputRef.current?.focus();
    }
  }, [isSearching]);

  const handleSelectBlockItem = useCallback(
    (item: CompletionItem) => {
      const symbolId = item.id.replace('block:', '');

      if (depth === 0) {
        dispatch('setSymbolInstanceSource', symbolId, 'preserveCurrent');
      } else {
        dispatch(
          'setOverrideValue',
          undefined,
          Overrides.encodeName(path, 'symbolID'),
          symbolId,
        );
      }
    },
    [depth, dispatch, path],
  );

  const handleUpdateParameters = (updatedParameters: string[]) => {
    if (depth === 0) {
      dispatch('setBlockParameters', undefined, updatedParameters);
    } else {
      dispatch(
        'setOverrideValue',
        undefined,
        Overrides.encodeName(path, 'blockParameters'),
        updatedParameters,
      );
    }
  };

  const handleSelectItem = (item: CompletionItem) => {
    if (item.id.startsWith('block:')) {
      handleSelectBlockItem(item);
    } else if (item.id.startsWith('style:')) {
      handleUpdateParameters((layer.blockParameters ?? []).concat(item.name));
    }
  };

  const handleDeleteParameer = (parameter: string) =>
    handleUpdateParameters(
      (layer.blockParameters ?? []).filter((p) => p !== parameter),
    );

  return (
    <TreeView.Row
      key={key}
      id={layer.do_objectID}
      depth={depth - 1}
      icon={depth !== 0 && <DragHandleDots2Icon />}
      onHoverChange={setHovered}
    >
      <Stack.V
        flex="1"
        border={`1px solid ${theme.colors.divider}`}
        padding="1px"
        margin="4px 0"
        borderRadius="6px"
        gap="2px"
      >
        <Stack.H flex="1" opacity={isDragging ? 0.5 : 1}>
          {isSearching ? (
            <InputFieldWithCompletions
              ref={modalSearchInputRef}
              placeholder={'Find component/style'}
              items={completionItems}
              onBlur={() => {
                setIsSearching(false);
              }}
              onSelectItem={handleSelectItem}
              // size={depth === 0 ? 'large' : 'medium'}
              style={{
                background: 'transparent',
              }}
            />
          ) : (
            <InputField.Root key={key} labelPosition="end" labelSize={60}>
              <InputField.Input
                style={{
                  background: 'transparent',
                }}
                value={layer.blockText ?? ''}
                placeholder={placeholderText}
                onKeyDown={(event) => {
                  switch (event.key) {
                    case '/': {
                      event.preventDefault();
                      event.stopPropagation();

                      setIsSearching(true);
                    }
                  }
                }}
                onChange={(value) => {
                  if (depth === 0) {
                    dispatch('setBlockText', undefined, value);
                  } else {
                    dispatch(
                      'setOverrideValue',
                      undefined,
                      Overrides.encodeName(path, 'blockText'),
                      value,
                    );
                  }
                }}
              />
              {hovered ? (
                <InputField.Button
                  onClick={() => {
                    setIsSearching(true);
                  }}
                >
                  Edit
                </InputField.Button>
              ) : (
                <InputField.Label>{componentName}</InputField.Label>
              )}
            </InputField.Root>
          )}
        </Stack.H>
        {layer.blockParameters && layer.blockParameters.length > 0 && (
          <Stack.H flexWrap="wrap" gap="2px">
            {layer.blockParameters.map((parameter) => (
              <Chip
                key={parameter}
                size="small"
                deletable
                monospace
                // TODO: This seems to permanently mutate block parameters in the layer tree.
                // Afterwards, if we add/remove block parameters they don't get rendered.
                // Refreshing the page fixes it.
                // onHoverDeleteChange={(isHovering) => {
                //   const updatedParameters = (
                //     layer.blockParameters ?? []
                //   ).filter((p) => p !== parameter);
                //   const overrideName = Overrides.encodeName(
                //     path,
                //     'blockParameters',
                //   );
                //   const updatedOverrideValues = selectedLayer.overrideValues
                //     .filter(
                //       (override) => override.overrideName !== overrideName,
                //     )
                //     .concat(
                //       SketchModel.overrideValue({
                //         overrideName,
                //         value: updatedParameters,
                //       }),
                //     );
                //   if (isHovering) {
                //     onSetOverriddenBlock({
                //       blockId: selectedLayer.symbolID,
                //       blockText: selectedLayer.blockText,
                //       blockParameters: selectedLayer.blockParameters,
                //       overrideValues: updatedOverrideValues,
                //       resolvedBlockText:
                //         selectedLayer.resolvedBlockData?.resolvedText,
                //     });
                //   } else {
                //     onSetOverriddenBlock(undefined);
                //   }
                // }}
                onDelete={() => handleDeleteParameer(parameter)}
              >
                {parameter}
              </Chip>
            ))}
          </Stack.H>
        )}
      </Stack.V>
    </TreeView.Row>
  );
}
