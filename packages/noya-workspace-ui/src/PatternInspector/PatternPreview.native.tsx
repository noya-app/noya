import React, { memo, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import styled from 'styled-components';
import { View } from 'react-native';

import { IconButton, PatternPreviewBackground } from 'noya-designsystem';
import { Base64, uuid, parseFilename } from 'noya-utils';
import { PatternPreviewProps } from './types';

const Container = styled(View)({
  flex: 1,
  minHeight: 150,
  borderRadius: 5,
  overflow: 'hidden',
  backgroundColor: 'white',
  justifyContent: 'center',
});

const ButtonContainer = styled(View)({
  flexDirection: 'row',
  position: 'absolute',
  top: 0,
  right: 0,
});

export default memo(function PatternPreview({
  pattern,
  onAddImage,
  onChangeImage,
}: PatternPreviewProps) {
  const processImage = useCallback(
    (base64Image: string, uri: string) => {
      const data = Base64.decode(base64Image);
      const { extension } = parseFilename(uri);
      const ref = `images/${uuid()}.${extension}`;

      onAddImage(data, ref);
      onChangeImage({
        _class: 'MSJSONFileReference',
        _ref_class: 'MSImageData',
        _ref: ref,
      });
    },
    [onAddImage, onChangeImage],
  );

  const handleOpenFile = useCallback(async () => {
    const results = await ImagePicker.launchImageLibraryAsync();

    if (results.cancelled) {
      return;
    }

    if (results.base64) {
      processImage(results.base64, results.uri);
      return;
    }

    const fileString = await FileSystem.readAsStringAsync(results.uri, {
      encoding: 'base64',
    });

    processImage(fileString, results.uri);
  }, [processImage]);

  return (
    <Container>
      {pattern.image && (
        <PatternPreviewBackground
          imageRef={pattern.image}
          fillType={pattern.patternFillType}
          tileScale={pattern.patternTileScale}
        />
      )}
      <ButtonContainer>
        <IconButton name="upload" variant="normal" onClick={handleOpenFile} />
      </ButtonContainer>
    </Container>
  );
});
