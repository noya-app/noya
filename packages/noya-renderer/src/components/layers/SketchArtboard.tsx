import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';

import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import {
  ClipProps,
  useBlurMaskFilter,
  useDeletable,
  usePaint,
} from 'noya-react-canvaskit';
import { Primitives, Selectors } from 'noya-state';
// import { useFontManager } from '../../contexts/FontManagerContext';
// import { useRenderingMode } from '../../contexts/RenderingModeContext';
import SketchGroup from './SketchGroup';
