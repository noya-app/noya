import { useApplicationState } from 'noya-app-state-context';
import {
  Divider,
  InputField,
  Label,
  LabeledElementView,
  Select,
} from 'noya-designsystem';
import { useDeepMemo } from 'noya-react-utils';
import {
  createObjectId,
  ElementFlexDirection,
  getElementLayerForObjectPath,
  getSelectedElementLayerPaths,
} from 'noya-state';
import { getAttributeValue, useTypescriptCompiler } from 'noya-typescript';
import { upperFirst } from 'noya-utils';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';

const CSSDimensionInput = memo(function CSSDimensionInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputField.Root id={id}>
      <InputField.NumberInput
        value={Number(value)}
        onNudge={useCallback(
          (amount: number) => onChange((Number(value) + amount).toString()),
          [onChange, value],
        )}
        onSubmit={useCallback(
          (value: number) => onChange(value.toString()),
          [onChange],
        )}
      />
    </InputField.Root>
  );
});

export const ElementLayoutInspector = memo(function ElementLayoutInspector() {
  const [state, dispatch] = useApplicationState();
  const compiler = useTypescriptCompiler();
  const objectPath = useDeepMemo(getSelectedElementLayerPaths(state)[0]);
  const elementLayer = getElementLayerForObjectPath(
    compiler.environment,
    objectPath,
  );

  const layout = elementLayer
    ? {
        flexDirection:
          getAttributeValue<ElementFlexDirection>(
            elementLayer.attributes,
            'flexDirection',
          ) ?? ('column' as const),
        flexBasis:
          getAttributeValue(elementLayer.attributes, 'flexBasis') ?? '0',
        flexGrow: getAttributeValue(elementLayer.attributes, 'flexGrow') ?? '1',
        flexShrink:
          getAttributeValue(elementLayer.attributes, 'flexShrink') ?? '1',
        paddingTop:
          getAttributeValue(elementLayer.attributes, 'paddingTop') ?? '0',
        paddingRight:
          getAttributeValue(elementLayer.attributes, 'paddingRight') ?? '0',
        paddingBottom:
          getAttributeValue(elementLayer.attributes, 'paddingBottom') ?? '0',
        paddingLeft:
          getAttributeValue(elementLayer.attributes, 'paddingLeft') ?? '0',
      }
    : {
        flexDirection: 'column' as const,
        flexBasis: '0',
        flexGrow: '1',
        flexShrink: '1',
        paddingTop: '0',
        paddingRight: '0',
        paddingBottom: '0',
        paddingLeft: '0',
      };

  const objectId = createObjectId(objectPath.layerId, objectPath.indexPath);

  const elementFlexBasisId = 'element-flex-basis';
  const elementFlexGrowId = 'element-flex-grow';
  const elementFlexShrinkId = 'element-flex-shrink';
  const elementPaddingTop = 'element-padding-top';
  const elementPaddingRight = 'element-padding-right';
  const elementPaddingBottom = 'element-padding-bottom';
  const elementPaddingLeft = 'element-padding-left';

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Dimensions</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.LabeledRow label="Flex">
          <LabeledElementView
            renderLabel={useCallback(({ id }) => {
              switch (id) {
                case elementFlexBasisId:
                  return <Label.Label>Size</Label.Label>;
                case elementFlexGrowId:
                  return <Label.Label>Grow</Label.Label>;
                case elementFlexShrinkId:
                  return <Label.Label>Shrink</Label.Label>;
              }
            }, [])}
          >
            <CSSDimensionInput
              id={elementFlexBasisId}
              value={layout.flexBasis}
              onChange={(value: string) => {
                dispatch('setElementFlexBasis', objectId, value.toString());
              }}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <CSSDimensionInput
              id={elementFlexGrowId}
              value={layout.flexGrow}
              onChange={(value: string) => {
                dispatch('setElementFlexGrow', objectId, value.toString());
              }}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <CSSDimensionInput
              id={elementFlexShrinkId}
              value={layout.flexShrink}
              onChange={(value: string) => {
                dispatch('setElementFlexShrink', objectId, value.toString());
              }}
            />
          </LabeledElementView>
        </InspectorPrimitives.LabeledRow>
      </InspectorPrimitives.Section>
      <div style={{ padding: '0 10px' }}>
        <Divider />
      </div>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Children Layout</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.LabeledRow label="Direction">
          <Select<ElementFlexDirection>
            id={'element-layout-input'}
            value={layout.flexDirection}
            options={['row', 'column']}
            getTitle={upperFirst}
            onChange={useCallback(
              (value: ElementFlexDirection) => {
                dispatch('setElementFlexDirection', objectId, value);
              },
              [dispatch, objectId],
            )}
          />
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.LabeledRow label="Padding">
          <LabeledElementView
            renderLabel={useCallback(({ id }) => {
              switch (id) {
                case elementPaddingTop:
                  return <Label.Label>Top</Label.Label>;
                case elementPaddingRight:
                  return <Label.Label>Right</Label.Label>;
                case elementPaddingBottom:
                  return <Label.Label>Bottom</Label.Label>;
                case elementPaddingLeft:
                  return <Label.Label>Left</Label.Label>;
              }
            }, [])}
          >
            <CSSDimensionInput
              id={elementPaddingTop}
              value={layout.paddingTop}
              onChange={(value: string) => {
                dispatch('setElementPaddingTop', objectId, value.toString());
              }}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <CSSDimensionInput
              id={elementPaddingRight}
              value={layout.paddingRight}
              onChange={(value: string) => {
                dispatch('setElementPaddingRight', objectId, value.toString());
              }}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <CSSDimensionInput
              id={elementPaddingBottom}
              value={layout.paddingBottom}
              onChange={(value: string) => {
                dispatch('setElementPaddingBottom', objectId, value.toString());
              }}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <CSSDimensionInput
              id={elementPaddingLeft}
              value={layout.paddingLeft}
              onChange={(value: string) => {
                dispatch('setElementPaddingLeft', objectId, value.toString());
              }}
            />
          </LabeledElementView>
        </InspectorPrimitives.LabeledRow>
      </InspectorPrimitives.Section>
    </>
  );
});
