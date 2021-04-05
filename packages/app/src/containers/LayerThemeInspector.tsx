import {
  CursorTextIcon,
  LinkBreak2Icon,
  PlusIcon,
  ResetIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { Button, Select, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useSelector } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

const NO_LAYER_STYLE = 'none';

export default memo(function LayerThemeInspector() {
  const iconColor = useTheme().colors.icon;

  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));

  const layerStyleOptions = useMemo(
    () => [NO_LAYER_STYLE, ...sharedStyles.map((style) => style.do_objectID)],
    [sharedStyles],
  );

  const getLayerStyleTitle = useCallback(
    (id) =>
      id === NO_LAYER_STYLE
        ? 'No Layer Style'
        : sharedStyles.find((style) => style.do_objectID === id)!.name,
    [sharedStyles],
  );

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Theme</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <Select
            id="theme-layer-style"
            value={'No Layer Style'}
            options={layerStyleOptions}
            getTitle={getLayerStyleTitle}
            onChange={() => {}}
          />
        </InspectorPrimitives.Row>
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <Button
            id="create-layer-style"
            tooltip="Create theme style from layer"
            onClick={useCallback(() => {}, [])}
          >
            <PlusIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="update-layer-style"
            tooltip="Update theme style to match layer"
            onClick={useCallback(() => {}, [])}
          >
            <UpdateIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="detach-layer-style"
            tooltip="Detach style from theme"
            onClick={useCallback(() => {}, [])}
          >
            <LinkBreak2Icon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="rename-style"
            tooltip="Rename theme style"
            onClick={useCallback(() => {}, [])}
          >
            <CursorTextIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="reset-style"
            tooltip="Reset layer style to theme style"
            onClick={useCallback(() => {}, [])}
          >
            <ResetIcon color={iconColor} />
          </Button>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
    </>
  );
});
