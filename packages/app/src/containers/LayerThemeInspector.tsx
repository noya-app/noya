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

  const onLayerStyleChange = useCallback(
    (value) => {
      const style = sharedStyles.find((s) => s.do_objectID === value);

      if (style !== undefined) dispatch('setLayerStyle', value, style.value);
      else dispatch('setLayerStyle', value, undefined);
    },
    [sharedStyles, dispatch],
  );

  const onAddLayerStyle = useCallback(() => {
    const styleName = String(prompt('New Style Layout Name'));

    dispatch('addLayerStyle', styleName, selectedLayers[0].style);
  }, [selectedLayers, dispatch]);

  /**
   * When adding a new style  layout. Whay should happen when multiselecting?
   */
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
            value={selectedLayerStyleId || 'No Layer Style'}
            options={layerStyleOptions}
            getTitle={getLayerStyleTitle}
            onChange={onLayerStyleChange}
          />
        </InspectorPrimitives.Row>
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <Button
            id="create-layer-style"
            tooltip="Create theme style from layer"
            onClick={onAddLayerStyle}
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
