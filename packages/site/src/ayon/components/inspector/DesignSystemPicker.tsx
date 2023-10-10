import { NoyaAPI, useNoyaClient } from 'noya-api';
import {
  Button,
  DropdownMenu,
  RegularMenuItem,
  Spacer,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { useAyonState } from '../../state/ayonState';

const designSystems = {
  '@noya-design-system/mui': 'Material Design',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/chakra': 'Chakra UI',
};

export function DesignSystemPicker() {
  const theme = useDesignSystemTheme();
  const [state, dispatch] = useAyonState();
  const [{ files, loading }, setFiles] = useState<{
    files: NoyaAPI.File[];
    loading: boolean;
  }>({ files: [], loading: true });
  const client = useNoyaClient();

  useEffect(() => {
    client.networkClient.files.list().then((files) => {
      setFiles({ files, loading: false });
    });
  }, [client]);

  const customDesignSystems = files
    .filter((file) => file.data.type === 'io.noya.ds')
    .map((file): RegularMenuItem<string> => {
      return {
        value: file.id,
        title: file.data.name,
      };
    });

  const designSystemMenu = createSectionedMenu(
    Object.entries(designSystems).map(([key, value]) => ({
      value: key as keyof typeof designSystems,
      title: value,
    })),
    customDesignSystems,
  );

  const currentDesignSystem =
    state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM;

  const displayName =
    currentDesignSystem.type === 'standard'
      ? designSystems[currentDesignSystem.id as keyof typeof designSystems]
      : customDesignSystems.find(
          (item) => item.value === currentDesignSystem.id,
        )?.title ?? null;

  const handleSelect = useCallback(
    (value: string) => {
      if (loading) return;

      if (value.startsWith('@noya-design-system')) {
        dispatch('setDesignSystem', 'standard', value);
      } else {
        dispatch('setDesignSystem', 'custom', value);
      }
    },
    [dispatch, loading],
  );

  return (
    <DropdownMenu items={designSystemMenu} onSelect={handleSelect}>
      <Button flex="1">
        {displayName}
        <Spacer.Horizontal />
        <ChevronDownIcon color={theme.colors.icon} />
      </Button>
    </DropdownMenu>
  );
}
