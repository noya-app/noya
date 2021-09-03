import {
  CursorTextIcon,
  LinkBreak2Icon,
  PlusIcon,
  ResetIcon,
  UpdateIcon,
} from 'noya-icons';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Button, Select } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useShallowArray } from 'noya-react-utils';

const NO_TEXT_STYLE = 'none';

export default memo(function ThemeTextInspector() {
  const [, dispatch] = useApplicationState();

  const iconColor = useTheme().colors.icon;

  const sharedTextStyles = useShallowArray(
    useSelector(Selectors.getSharedTextStyles),
  );
  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );

  const selectedTextStyleId = useMemo(
    () =>
      !selectedLayers.every(
        (v) => v.sharedStyleID === selectedLayers[0].sharedStyleID,
      )
        ? undefined
        : selectedLayers[0].sharedStyleID,
    [selectedLayers],
  );

  const textStyleOptions = useMemo(
    () => [
      NO_TEXT_STYLE,
      ...sharedTextStyles.map((style) => style.do_objectID),
    ],
    [sharedTextStyles],
  );

  const getLayerStyleTitle = useCallback(
    (id) =>
      id === NO_TEXT_STYLE
        ? 'No Text Style'
        : sharedTextStyles.find((style) => style.do_objectID === id)!.name,
    [sharedTextStyles],
  );

  const onSelect = useCallback(
    (value) => {
      dispatch('setTextStyle', value === NO_TEXT_STYLE ? undefined : value);
    },
    [dispatch],
  );

  const onAdd = useCallback(() => {
    const styleName = prompt('New Text Style Name');

    if (!styleName) return;
    dispatch('addTextStyle', styleName, selectedLayers[0].style);
  }, [selectedLayers, dispatch]);

  const onRename = useCallback(() => {
    if (!selectedTextStyleId) return;

    const newName = prompt('Rename Text Style');

    if (!newName) return;
    dispatch('setTextStyleName', selectedTextStyleId, newName);
  }, [selectedTextStyleId, dispatch]);

  const onDetach = useCallback(() => dispatch('setTextStyle'), [dispatch]);

  const onUpdate = useCallback(() => {
    if (!selectedTextStyleId) return;

    dispatch('updateTextStyle', selectedTextStyleId, selectedLayers[0].style);
  }, [selectedTextStyleId, selectedLayers, dispatch]);

  const onReset = useCallback(() => {
    const style = sharedTextStyles.find(
      (s) => s.do_objectID === selectedTextStyleId,
    );

    if (selectedTextStyleId && style) {
      dispatch('setTextStyle', selectedTextStyleId);
    }
  }, [selectedTextStyleId, sharedTextStyles, dispatch]);

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Text Style</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row>
          <Select
            id="theme-text-style"
            value={selectedTextStyleId || NO_TEXT_STYLE}
            options={textStyleOptions}
            getTitle={getLayerStyleTitle}
            onChange={onSelect}
          />
        </InspectorPrimitives.Row>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row>
          <Button
            id="create-text-style"
            flex="1 1 0%"
            tooltip="Create text style from text"
            onClick={onAdd}
          >
            <PlusIcon color={iconColor} />
          </Button>
          <InspectorPrimitives.HorizontalSeparator />
          <Button
            id="update-text-style"
            flex="1 1 0%"
            disabled={selectedTextStyleId === undefined}
            tooltip="Update text style to match text"
            onClick={onUpdate}
          >
            <UpdateIcon color={iconColor} />
          </Button>
          <InspectorPrimitives.HorizontalSeparator />
          <Button
            id="detach-text-style"
            flex="1 1 0%"
            disabled={selectedTextStyleId === undefined}
            tooltip="Detach text from text style"
            onClick={onDetach}
          >
            <LinkBreak2Icon color={iconColor} />
          </Button>
          <InspectorPrimitives.HorizontalSeparator />
          <Button
            id="rename-text-style"
            flex="1 1 0%"
            disabled={selectedTextStyleId === undefined}
            tooltip="Rename text style"
            onClick={onRename}
          >
            <CursorTextIcon color={iconColor} />
          </Button>
          <InspectorPrimitives.HorizontalSeparator />
          <Button
            id="reset-text-style"
            flex="1 1 0%"
            disabled={selectedTextStyleId === undefined}
            tooltip="Reset text to text style"
            onClick={onReset}
          >
            <ResetIcon color={iconColor} />
          </Button>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
    </>
  );
});
