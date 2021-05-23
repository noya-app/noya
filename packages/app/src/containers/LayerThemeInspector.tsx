import {
  CursorTextIcon,
  LinkBreak2Icon,
  PlusIcon,
  ResetIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Button, Select, Spacer } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useDispatch, useSelector } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiValue from '../utils/getMultiValue';

const NO_LAYER_STYLE = 'none';

interface Props {
  style?: Sketch.Style;
  sharedStyleId?: string;
  sharedStyles: Sketch.SharedStyle[];
}

const LayerThemeInspectorContent = memo(function LayerThemeInspectorContent({
  style,
  sharedStyleId,
  sharedStyles,
}: Props) {
  const dispatch = useDispatch();

  const iconColor = useTheme().colors.icon;

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

  const onSelect = useCallback(
    (value) => {
      dispatch('setThemeStyle', value === NO_LAYER_STYLE ? undefined : value);
    },
    [dispatch],
  );

  const onAdd = useCallback(() => {
    const name = prompt('New style name');

    if (!name) return;

    dispatch('addThemeStyle', name, style);
  }, [dispatch, style]);

  const onRename = useCallback(() => {
    if (!sharedStyleId) return;

    const name = prompt('Rename style');

    if (!name) return;

    dispatch('setThemeStyleName', sharedStyleId, name);
  }, [sharedStyleId, dispatch]);

  const onDetach = useCallback(() => dispatch('setThemeStyle'), [dispatch]);

  const onUpdate = useCallback(() => {
    if (!sharedStyleId) return;

    dispatch('updateThemeStyle', sharedStyleId, style);
  }, [sharedStyleId, dispatch, style]);

  const onReset = useCallback(() => {
    const style = sharedStyles.find((s) => s.do_objectID === sharedStyleId);

    if (!sharedStyleId || !style) return;

    dispatch('setThemeStyle', sharedStyleId);
  }, [sharedStyleId, sharedStyles, dispatch]);

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Theme</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Select
          id="theme-layer-style"
          value={sharedStyleId || NO_LAYER_STYLE}
          options={layerStyleOptions}
          getTitle={getLayerStyleTitle}
          onChange={onSelect}
        />
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Button
          id="create-layer-style"
          tooltip="Create theme style from layer"
          onClick={onAdd}
        >
          <PlusIcon color={iconColor} />
        </Button>
        <Spacer.Horizontal size={10} />
        <Button
          id="update-layer-style"
          disabled={sharedStyleId === undefined}
          tooltip="Update theme style to match layer"
          onClick={onUpdate}
        >
          <UpdateIcon color={iconColor} />
        </Button>
        <Spacer.Horizontal size={10} />
        <Button
          id="detach-layer-style"
          disabled={sharedStyleId === undefined}
          tooltip="Detach style from theme"
          onClick={onDetach}
        >
          <LinkBreak2Icon color={iconColor} />
        </Button>
        <Spacer.Horizontal size={10} />
        <Button
          id="rename-style"
          disabled={sharedStyleId === undefined}
          tooltip="Rename theme style"
          onClick={onRename}
        >
          <CursorTextIcon color={iconColor} />
        </Button>
        <Spacer.Horizontal size={10} />
        <Button
          id="reset-style"
          disabled={sharedStyleId === undefined}
          tooltip="Reset layer style to theme style"
          onClick={onReset}
        >
          <ResetIcon color={iconColor} />
        </Button>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});

export default function LayerThemeInspector() {
  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));
  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const sharedStyleId = useMemo(
    () => getMultiValue(selectedLayers.map((layer) => layer.sharedStyleID)),
    [selectedLayers],
  );

  return (
    <LayerThemeInspectorContent
      style={selectedLayers[0]?.style}
      sharedStyleId={sharedStyleId}
      sharedStyles={sharedStyles}
    />
  );
}
