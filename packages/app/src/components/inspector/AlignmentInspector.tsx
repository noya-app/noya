import { memo } from 'react';
import styled from 'styled-components';
import {
  AlignLeftIcon,
  AlignCenterHorizontallyIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignCenterVerticallyIcon,
  AlignBottomIcon,
  SpaceEvenlyHorizontallyIcon,
  SpaceEvenlyVerticallyIcon,
} from '@radix-ui/react-icons';

const AlignmentInspectorContainer = styled.div(({ theme }) => ({
  display: 'flex',
  height: '35px',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  // background: theme.colors.divider,
  color: 'rgb(139, 139, 139)',
}));

interface AlignmentInspectorProps {}

function AlignmentInspector(props: AlignmentInspectorProps) {
  return (
    <AlignmentInspectorContainer>
      <SpaceEvenlyHorizontallyIcon />
      <SpaceEvenlyVerticallyIcon />
      <AlignLeftIcon />
      <AlignCenterHorizontallyIcon />
      <AlignRightIcon />
      <AlignTopIcon />
      <AlignCenterVerticallyIcon />
      <AlignBottomIcon />
    </AlignmentInspectorContainer>
  );
}

export default memo(AlignmentInspector);
