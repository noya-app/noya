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
  getSelectedComponentElements,
} from 'noya-state';
import { getAttributeValue, useTypescriptCompiler } from 'noya-typescript';
import { upperFirst } from 'noya-utils';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';

export const ElementLayoutInspector = memo(function ElementLayoutInspector() {
  const [state, dispatch] = useApplicationState();
  const compiler = useTypescriptCompiler();
  const objectPath = useDeepMemo(getSelectedComponentElements(state)[0]);
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
      }
    : {
        flexDirection: 'column' as const,
        flexBasis: '0',
        flexGrow: '1',
        flexShrink: '1',
      };

  const objectId = createObjectId(objectPath.layerId, objectPath.indexPath);

  const elementFlexBasisId = 'element-flex-basis';
  const elementFlexGrowId = 'element-flex-grow';
  const elementFlexShrinkId = 'element-flex-shrink';

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
            <InputField.Root id={elementFlexBasisId}>
              <InputField.NumberInput
                value={Number(layout.flexBasis)}
                onNudge={useCallback(
                  (value: number) => {
                    dispatch(
                      'setElementFlexBasis',
                      objectId,
                      (Number(layout.flexBasis) + value).toString(),
                    );
                  },
                  [dispatch, layout.flexBasis, objectId],
                )}
                onSubmit={useCallback(
                  (value: number) => {
                    dispatch('setElementFlexBasis', objectId, value.toString());
                  },
                  [dispatch, objectId],
                )}
              />
            </InputField.Root>
            <InspectorPrimitives.HorizontalSeparator />
            <InputField.Root id={elementFlexGrowId}>
              <InputField.NumberInput
                value={Number(layout.flexGrow)}
                onNudge={useCallback(
                  (value: number) => {
                    dispatch(
                      'setElementFlexGrow',
                      objectId,
                      (Number(layout.flexGrow) + value).toString(),
                    );
                  },
                  [dispatch, layout.flexGrow, objectId],
                )}
                onSubmit={useCallback(
                  (value: number) => {
                    dispatch('setElementFlexGrow', objectId, value.toString());
                  },
                  [dispatch, objectId],
                )}
              />
            </InputField.Root>
            <InspectorPrimitives.HorizontalSeparator />
            <InputField.Root id={elementFlexShrinkId}>
              <InputField.NumberInput
                value={Number(layout.flexShrink)}
                onNudge={useCallback(
                  (value: number) => {
                    dispatch(
                      'setElementFlexShrink',
                      objectId,
                      (Number(layout.flexShrink) + value).toString(),
                    );
                  },
                  [dispatch, layout.flexShrink, objectId],
                )}
                onSubmit={useCallback(
                  (value: number) => {
                    dispatch(
                      'setElementFlexShrink',
                      objectId,
                      value.toString(),
                    );
                  },
                  [dispatch, objectId],
                )}
              />
            </InputField.Root>
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
      </InspectorPrimitives.Section>
    </>
  );
});
