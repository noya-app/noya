import React, { memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { View, TouchableOpacity } from 'react-native';

import Sketch from 'noya-file-format';
import {
  Select,
  Slider,
  useHover,
  InputField,
  PatternPreviewBackground,
  SupportedImageUploadType,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
} from 'noya-designsystem';
import { getFileExtensionForType, uuid } from 'noya-utils';
import { Primitives } from '../primitives';
import {
  PatternFillType,
  PatternPreviewProps,
  PatternInspectorProps,
  PATTERN_FILL_TYPE_OPTIONS,
} from './types';

const Container = styled(View)({});

const UploadButton = styled(TouchableOpacity)({});

export default memo(function PatternPreview({
  pattern,
  onAddImage,
  onChangeImage,
}: PatternPreviewProps) {
  return <Container></Container>;
});
