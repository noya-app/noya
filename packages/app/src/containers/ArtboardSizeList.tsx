import { useApplicationState } from 'noya-app-state-context';
import { Select, Spacer, TreeView } from 'noya-designsystem';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

type Preset = { name: string; width: number; height: number };
type PresetGroup = { name: string; presets: Preset[] };
type PresetCategory = { name: string; groups: PresetGroup[] };

const Header = styled.div(({ theme }) => ({
  display: 'flex',
  padding: '8px',
}));

const canvasSizePresets: PresetCategory[] = [
  {
    name: 'Apple Devices',
    groups: [
      {
        name: 'iPhone',
        presets: [
          { name: 'iPhone 8', width: 375, height: 667 },
          { name: 'iPhone 8 Plus', width: 414, height: 736 },
          { name: 'iPhone SE', width: 320, height: 568 },
          { name: 'iPhone 13 Mini', width: 375, height: 812 },
          { name: 'iPhone 13 / 13 Pro', width: 390, height: 844 },
          { name: 'iPhone 13 Pro Max', width: 428, height: 926 },
          { name: 'iPhone 14', width: 390, height: 844 },
          { name: 'iPhone 14 Pro', width: 393, height: 852 },
          { name: 'iPhone 14 Plus', width: 428, height: 926 },
          { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
        ],
      },
      {
        name: 'iPad',
        presets: [
          { name: '7.9" iPad mini', width: 768, height: 1024 },
          { name: '10.2" iPad', width: 810, height: 1080 },
          { name: '10.5" iPad Air', width: 834, height: 1112 },
          { name: '10.9" iPad Air', width: 840, height: 1180 },
          { name: '11" iPad Pro', width: 834, height: 1194 },
          { name: '12.9" iPad Pro', width: 1024, height: 1366 },
        ],
      },
      {
        name: 'Apple Watch',
        presets: [
          { name: 'Apple Watch 38mm', width: 136, height: 170 },
          { name: 'Apple Watch 40mm', width: 162, height: 197 },
          { name: 'Apple Watch 42mm', width: 156, height: 195 },
          { name: 'Apple Watch 44mm', width: 184, height: 224 },
        ],
      },
      {
        name: 'Apple TV',
        presets: [{ name: 'Apple TV', width: 1920, height: 1080 }],
      },
    ],
  },
  {
    name: 'Android Devices',
    groups: [],
  },
  {
    name: 'Responsive Web',
    groups: [],
  },
  {
    name: 'Social Media',
    groups: [],
  },
  {
    name: 'Paper Sizes',
    groups: [],
  },
];

const SizeLabel = styled.span(({ theme }) => ({
  ...theme.textStyles.code,
}));

export default function ArtboardSizeList() {
  const [, dispatch] = useApplicationState();

  const categoryNames = useMemo(
    () => canvasSizePresets.map((category) => category.name),
    [],
  );
  const [categoryName, setCategoryName] = useState(categoryNames[0]);

  const layerElements = useMemo(() => {
    return canvasSizePresets
      .find((category) => category.name === categoryName)!
      .groups.map(({ name, presets }) => {
        return [
          <TreeView.Row
            isSectionHeader
            expanded
            depth={0}
            key={`group-${name}`}
          >
            {name}
          </TreeView.Row>,
          ...presets.map(({ name, width, height }) => (
            <TreeView.Row
              depth={1}
              key={name}
              onPress={() => {
                dispatch('insertArtboard', { name, width, height });
              }}
            >
              <TreeView.RowTitle>{name}</TreeView.RowTitle>
              <Spacer.Horizontal size={8} />
              <SizeLabel>
                {width}×{height}
              </SizeLabel>
            </TreeView.Row>
          )),
        ];
      });
  }, [dispatch, categoryName]);

  return (
    <>
      <Header>
        <Select
          id="artboard-preset"
          value={categoryName}
          options={categoryNames}
          onChange={setCategoryName}
        />
      </Header>
      <TreeView.Root>{layerElements}</TreeView.Root>
    </>
  );
}
