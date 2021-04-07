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
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

const NO_LAYER_STYLE = 'none';

export default memo(function LayerThemeInspector() {
  const [, dispatch] = useApplicationState();

  const iconColor = useTheme().colors.icon;

  const sharedStyles = useShallowArray(useSelector(Selectors.getSharedStyles));
  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );

  const selectedLayerStyleId = useMemo(
    () =>
      !selectedLayers.every(
        (v) => v.sharedStyleID === selectedLayers[0].sharedStyleID,
      )
        ? undefined
        : selectedLayers[0].sharedStyleID,
    [selectedLayers],
  );

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
    const styleName = prompt('New Style Layout Name');

    if (!styleName) return;
    dispatch('addThemeStyle', styleName, selectedLayers[0].style);
  }, [selectedLayers, dispatch]);

  const onRename = useCallback(() => {
    if (!selectedLayerStyleId) return;

    const newName = prompt('Rename Layout style');

    if (!newName) return;
    dispatch('setThemeStyleName', selectedLayerStyleId, newName);
  }, [selectedLayerStyleId, dispatch]);

  const onDetach = useCallback(() => dispatch('setThemeStyle'), [dispatch]);

  const onUpdate = useCallback(() => {
    console.log('why?');
    if (!selectedLayerStyleId) return;

    dispatch('updateThemeStyle', selectedLayerStyleId, selectedLayers[0].style);
  }, [selectedLayerStyleId, selectedLayers, dispatch]);

  const onReset = useCallback(() => {
    const style = sharedStyles.find(
      (s) => s.do_objectID === selectedLayerStyleId,
    );

    if (selectedLayerStyleId && style) {
      dispatch('setThemeStyle', selectedLayerStyleId, style.value);
    }
  }, [selectedLayerStyleId, sharedStyles, dispatch]);

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
            value={selectedLayerStyleId || NO_LAYER_STYLE}
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
            disabled={selectedLayerStyleId === undefined}
            tooltip="Update theme style to match layer"
            onClick={onUpdate}
          >
            <UpdateIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="detach-layer-style"
            disabled={selectedLayerStyleId === undefined}
            tooltip="Detach style from theme"
            onClick={onDetach}
          >
            <LinkBreak2Icon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="rename-style"
            disabled={selectedLayerStyleId === undefined}
            tooltip="Rename theme style"
            onClick={onRename}
          >
            <CursorTextIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal size={10} />
          <Button
            id="reset-style"
            disabled={selectedLayerStyleId === undefined}
            tooltip="Reset layer style to theme style"
            onClick={onReset}
          >
            <ResetIcon color={iconColor} />
          </Button>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
    </>
  );
});
