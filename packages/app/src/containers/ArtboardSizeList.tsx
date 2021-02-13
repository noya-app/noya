import { useMemo } from 'react';
import * as TreeView from '../components/TreeView';
import * as Spacer from '../components/Spacer';
import styled from 'styled-components';
import { useApplicationState } from '../contexts/ApplicationStateContext';

type Preset = { name: string; width: number; height: number };
type PresetGroup = { name: string; presets: Preset[] };
type PresetCategory = { name: string; groups: PresetGroup[] };

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
          { name: 'iPhone 11 Pro', width: 375, height: 812 },
          { name: 'iPhone 11', width: 414, height: 896 },
          { name: 'iPhone 11 Pro Max', width: 414, height: 896 },
          { name: 'iPhone 12 Mini', width: 375, height: 812 },
          { name: 'iPhone 12', width: 375, height: 844 },
          { name: 'iPhone 12 Pro', width: 375, height: 844 },
          { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
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
    groups: [
      {
        name: 'iPhone',
        presets: [
          { name: 'iPhone 8', width: 375, height: 667 },
          { name: 'iPhone 8 Plus', width: 414, height: 736 },
        ],
      },
    ],
  },
];

const SizeLabel = styled.span(({ theme }) => ({
  ...theme.textStyles.code,
}));

export default function ArtboardSizeList() {
  const [, dispatch] = useApplicationState();

  const layerElements = useMemo(() => {
    return canvasSizePresets[0].groups.map(({ name, presets }) => {
      return [
        <TreeView.SectionHeader expanded={true} depth={0} key={`group-${name}`}>
          {name}
        </TreeView.SectionHeader>,
        ...presets.map(({ name, width, height }) => (
          <TreeView.Row
            depth={1}
            key={name}
            onClick={() => {
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
  }, [dispatch]);

  return <TreeView.Root>{layerElements}</TreeView.Root>;
}
